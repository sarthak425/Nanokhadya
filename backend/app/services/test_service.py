"""
TestService — orchestrates the complete food safety test pipeline.

Flow:
  1. Acquire sensor reading (from SensorDataSource)
  2. Validate data
  3. Preprocess
  4. Load or train ML model
  5. Run ResultEngine
  6. Persist to database
  7. Return TestResult

This is the primary application service used by API routes.
"""
from __future__ import annotations
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import numpy as np
from sqlalchemy.orm import Session

from app.core.config import settings
from app.domain.enums import DataSourceType, FoodType, PredictionLabel, ValidationStatus
from app.domain.models import ModelMetadata, PCAResult, TestResult
from app.hardware.device_manager import get_sensor_source
from app.acquisition.data_validator import DataValidator
from app.processing.preprocessing import SpectralPreprocessor
from app.ml.model_registry import ModelRegistry
from app.ml.model_trainer import ModelTrainer
from app.decision.result_engine import ResultEngine
from app.database.models import (
    Device, Operator, TestRecord, PredictionRecord, MLModel,
)

logger = logging.getLogger("nanotech.services.test")

_registry = ModelRegistry()
_validator = DataValidator()
_preprocessor = SpectralPreprocessor()
_result_engine = ResultEngine()

# Training data cache per food type (populated on first test if no model exists)
_train_cache: dict[str, tuple] = {}


class TestService:
    def __init__(self, db: Session):
        self.db = db

    async def run_test(
        self,
        food_type: str,
        operator_id: str = "default-operator",
    ) -> TestResult:
        """Execute one complete food safety test through the full pipeline."""
        test_id = f"FS-{uuid.uuid4().hex[:8].upper()}"
        logger.info("TestService: starting test %s for %s", test_id, food_type)

        source = get_sensor_source()

        # ── 1. Connect if needed ──────────────────────────────────────────────
        if not source.is_connected():
            connected = await source.connect()
            if not connected:
                raise RuntimeError("Could not connect to sensor data source.")

        # ── 2. Ensure default operator + device exist in DB ──────────────────
        device_info = source.get_device_info()
        device_id = device_info["device_id"]
        self._ensure_device(device_id, device_info)
        self._ensure_operator(operator_id)

        # ── 3. Acquire sensor reading ─────────────────────────────────────────
        reading = await source.acquire_reading(
            test_id=test_id,
            operator_id=operator_id,
            food_type=food_type,
            device_id=device_id,
        )

        # ── 4. Validate ───────────────────────────────────────────────────────
        validation = _validator.validate(reading)
        if not validation.is_valid:
            logger.error("TestService: validation failed for %s", test_id)
            # Save failed test record
            self._save_failed_test(test_id, operator_id, device_id, food_type, reading, validation)
            raise ValueError(f"Sensor data validation failed: {validation.errors}")

        # ── 5. Preprocess ─────────────────────────────────────────────────────
        preprocessed = _preprocessor.process(reading)

        # ── 6. Load or train model ────────────────────────────────────────────
        model_result = _registry.get_latest_model(food_type=food_type)
        if model_result is None:
            logger.info("TestService: no trained model found — training development model for %s", food_type)
            model_result = self._train_development_model(food_type)

        pipeline, meta = model_result

        model_metadata = ModelMetadata(
            model_id=meta["model_id"],
            model_type=meta.get("model_type", "SVM"),
            model_version=meta["version"],
            dataset_id=meta.get("dataset_id"),
            dataset_label=meta.get("dataset_label"),
            food_type=meta.get("food_type"),
            is_development_model=meta.get("is_development_model", True),
            trained_at=datetime.fromisoformat(meta["trained_at"]) if meta.get("trained_at") else None,
        )

        # ── 7. Run PCA + SVM via ResultEngine ─────────────────────────────────
        X_train, y_train = _train_cache.get(food_type, (None, None))
        X_train_arr = np.array(X_train) if X_train else None

        prediction, pca_scatter = _result_engine.predict(
            feature_vector=preprocessed.feature_vector,
            pipeline=pipeline,
            model_metadata=model_metadata,
            X_train=X_train_arr,
            y_train=y_train,
        )

        # ── 8. Build PCAResult ────────────────────────────────────────────────
        pca_result = None
        if pca_scatter:
            sample_pt = pca_scatter.get("new_sample")
            pca_result = PCAResult(
                components=[sample_pt["x"], sample_pt["y"]] if sample_pt else [],
                explained_variance_ratio=pca_scatter.get("explained_variance_ratio", []),
                n_components_used=2,
                training_scatter=pca_scatter.get("training_points"),
            )

        # ── 9. Build final result ─────────────────────────────────────────────
        possible_issue = _result_engine.get_possible_issue(prediction.predicted_label)

        raw_channels = [
            {
                "channel": ch.index + 1,
                "wavelength": ch.wavelength_nm,
                "rawValue": ch.raw_value,
                "processedValue": ch.processed_value,
            }
            for ch in reading.channels
        ]

        test_result = TestResult(
            test_id=test_id,
            device_id=device_id,
            operator_id=operator_id,
            food_type=food_type,
            source=reading.source.value,
            timestamp=reading.timestamp,
            raw_channels=raw_channels,
            preprocessing_steps=preprocessed.preprocessing_steps,
            validation_status=validation.status,
            validation_warnings=validation.warnings,
            pca_result=pca_result,
            prediction=prediction,
            final_label=prediction.predicted_label,
            possible_issue=possible_issue,
            model_metadata=model_metadata,
        )

        # ── 10. Persist to DB ─────────────────────────────────────────────────
        self._save_test(test_result)

        logger.info(
            "TestService: test %s complete — result=%s",
            test_id, prediction.predicted_label,
        )
        return test_result

    # ── Private helpers ───────────────────────────────────────────────────────

    def _train_development_model(self, food_type: str) -> tuple:
        """Train a development model using synthetic data. Cached per food type."""
        from app.hardware.development_data_source import DevelopmentDataSource
        dev = DevelopmentDataSource(seed=42)
        X, y = dev.generate_training_batch(food_type=food_type, samples_per_class=60)
        _train_cache[food_type] = (X, y)

        trainer = ModelTrainer(_registry)
        result = trainer.train(
            X=X, y=y, food_type=food_type,
            is_development_model=True,
            dataset_label="Synthetic development dataset — NOT validated",
        )
        return _registry.load(result.model_id)

    def _ensure_device(self, device_id: str, info: dict) -> None:
        if not self.db.get(Device, device_id):
            self.db.add(Device(
                id=device_id,
                name=info.get("name", device_id),
                sensor_type=info.get("sensor_type", "AS7265x"),
                channel_count=info.get("channel_count", 18),
                firmware_version=info.get("firmware_version"),
            ))
            self.db.commit()

    def _ensure_operator(self, operator_id: str) -> None:
        if not self.db.get(Operator, operator_id):
            self.db.add(Operator(id=operator_id, name=operator_id))
            self.db.commit()

    def _save_test(self, result: TestResult) -> None:
        record = TestRecord(
            id=result.test_id,
            operator_id=result.operator_id,
            device_id=result.device_id,
            food_type=result.food_type,
            source=result.source,
            timestamp=result.timestamp,
            validation_status=result.validation_status.value,
            validation_warnings=json.dumps(result.validation_warnings),
            preprocessing_steps=json.dumps(result.preprocessing_steps),
            raw_channels=result.raw_channels,
            pca_components=json.dumps(result.pca_result.components if result.pca_result else []),
            final_label=result.final_label.value if result.final_label else None,
            possible_issue=result.possible_issue,
        )
        self.db.add(record)

        if result.prediction:
            pred = result.prediction
            ml_model = self.db.get(MLModel, pred.model_metadata.model_id) if pred.model_metadata else None
            pred_record = PredictionRecord(
                test_id=result.test_id,
                model_id=pred.model_metadata.model_id if pred.model_metadata else None,
                raw_label=pred.raw_label,
                predicted_label=pred.predicted_label.value,
                probability=pred.probability,
                confidence_tier=pred.confidence_tier.value,
                class_probabilities=pred.class_probabilities,
            )
            self.db.add(pred_record)

        self.db.commit()
        logger.debug("TestService: test %s persisted to database", result.test_id)

    def _save_failed_test(self, test_id, operator_id, device_id, food_type, reading, validation):
        record = TestRecord(
            id=test_id,
            operator_id=operator_id,
            device_id=device_id,
            food_type=food_type,
            source=reading.source.value,
            timestamp=reading.timestamp,
            validation_status=ValidationStatus.INVALID.value,
            validation_warnings=json.dumps(validation.errors + validation.warnings),
            final_label=PredictionLabel.UNKNOWN.value,
        )
        self.db.add(record)
        self.db.commit()
