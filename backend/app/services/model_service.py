"""
ModelService — exposes model training, evaluation, and management via service layer.
"""
from __future__ import annotations
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.database.models import MLModel
from app.ml.model_registry import ModelRegistry
from app.ml.model_trainer import ModelTrainer, TrainingResult
from app.services.dataset_service import DatasetService

logger = logging.getLogger("nanotech.services.model")

_registry = ModelRegistry()


class ModelService:
    def __init__(self, db: Session):
        self.db = db
        self.dataset_service = DatasetService(db)

    def train_from_dataset(
        self,
        dataset_id: str,
        pca_components: int = 2,
        svm_kernel: str = "rbf",
        svm_c: float = 1.0,
    ) -> TrainingResult:
        """Train a new model from a stored dataset."""
        dataset = self.db.get(MLModel, dataset_id)
        # Load data via DatasetService
        X, y = self.dataset_service.load_xy(dataset_id)

        from app.database.models import Dataset
        ds = self.db.get(Dataset, dataset_id)
        is_dev = ds.is_development_data if ds else True

        trainer = ModelTrainer(_registry)
        result = trainer.train(
            X=X, y=y,
            food_type=ds.food_type if ds else "Unknown",
            dataset_id=dataset_id,
            dataset_label=ds.name if ds else None,
            is_development_model=is_dev,
            pca_components=pca_components,
            svm_kernel=svm_kernel,
            svm_c=svm_c,
        )

        # Persist model record to DB
        ml_model = MLModel(
            id=result.model_id,
            version=result.version,
            model_type="SVM",
            food_type=result.food_type,
            dataset_id=dataset_id,
            dataset_label=result.metrics.get("dataset_label"),
            is_development_model=result.is_development_model,
            is_active=True,
            pca_components=pca_components,
            svm_kernel=svm_kernel,
            classes=str(result.classes),
            evaluation_metrics=result.metrics,
            training_sample_count=result.sample_count,
            trained_at=result.trained_at,
        )
        self.db.add(ml_model)
        self.db.commit()
        return result

    def list_models(self) -> list[dict]:
        return _registry.list_models()

    def get_model_details(self, model_id: str) -> dict:
        _, meta = _registry.load(model_id)
        return meta
