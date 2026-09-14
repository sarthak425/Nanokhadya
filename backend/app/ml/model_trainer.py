"""
ModelTrainer — trains the PCA+SVM pipeline on labelled spectral datasets.

Supports both real labelled CSV datasets and development synthetic data.
All training metadata is recorded so every result can be traced to a model version.
"""
from __future__ import annotations
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score

from app.ml.model_pipeline import build_pipeline, get_pca_scatter_data
from app.ml.evaluation import compute_evaluation_metrics
from app.ml.model_registry import ModelRegistry
from app.core.config import settings

logger = logging.getLogger("nanotech.ml.trainer")

_MIN_SAMPLES_PER_CLASS = 5


class TrainingResult:
    def __init__(
        self,
        model_id: str,
        version: str,
        food_type: str,
        classes: list[str],
        metrics: dict,
        is_development_model: bool,
        sample_count: int,
        trained_at: datetime,
        pca_scatter: Optional[dict] = None,
        warnings: list[str] = None,
    ):
        self.model_id = model_id
        self.version = version
        self.food_type = food_type
        self.classes = classes
        self.metrics = metrics
        self.is_development_model = is_development_model
        self.sample_count = sample_count
        self.trained_at = trained_at
        self.pca_scatter = pca_scatter
        self.warnings = warnings or []


class ModelTrainer:
    """
    Trains the StandardScaler → PCA → SVM pipeline on spectral data.
    Performs cross-validation to produce honest evaluation metrics.
    """

    def __init__(self, registry: ModelRegistry):
        self.registry = registry

    def train(
        self,
        X: list[list[float]],
        y: list[str],
        food_type: str,
        dataset_id: Optional[str] = None,
        dataset_label: Optional[str] = None,
        is_development_model: bool = True,
        pca_components: int = 2,
        svm_kernel: str = "rbf",
        svm_c: float = 1.0,
    ) -> TrainingResult:
        """
        Train and register a model.

        Args:
            X: Feature matrix (n_samples × 18 channels)
            y: Class labels
            food_type: Food category being modelled
            dataset_id: Reference to source dataset in DB
            dataset_label: Human-readable dataset name
            is_development_model: Must be True if data is synthetic
            pca_components: PCA dimensions
            svm_kernel: SVM kernel type
            svm_c: SVM regularization strength
        """
        X_arr = np.array(X, dtype=float)
        classes = sorted(set(y))
        warnings: list[str] = []

        # Pre-flight checks
        for cls in classes:
            count = sum(1 for label in y if label == cls)
            if count < _MIN_SAMPLES_PER_CLASS:
                msg = f"Class '{cls}' has only {count} samples (minimum {_MIN_SAMPLES_PER_CLASS} recommended)"
                warnings.append(msg)
                logger.warning("ModelTrainer: %s", msg)

        if len(classes) < 2:
            raise ValueError("Training requires at least 2 classes.")

        if len(X_arr) < 10:
            raise ValueError(f"Too few training samples: {len(X_arr)}. Minimum is 10.")

        # Adjust PCA components
        max_components = min(X_arr.shape[0] - 1, X_arr.shape[1])
        pca_components = min(pca_components, max_components)

        # Build and fit pipeline
        pipeline = build_pipeline(pca_components=pca_components, svm_kernel=svm_kernel, svm_c=svm_c)
        pipeline.fit(X_arr, y)
        logger.info("ModelTrainer: pipeline fitted on %d samples", len(X_arr))

        # Cross-validation metrics (stratified k-fold)
        n_splits = min(5, min(sum(1 for lbl in y if lbl == cls) for cls in classes))
        n_splits = max(2, n_splits)
        cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        cv_scores = cross_val_score(pipeline, X_arr, y, cv=cv, scoring="accuracy")
        metrics = compute_evaluation_metrics(pipeline, X_arr, y, cv_scores)

        if len(X_arr) < 30:
            warnings.append(
                f"Small dataset ({len(X_arr)} samples). "
                "Cross-validation metrics may not be reliable. "
                "Collect more labelled samples for trustworthy evaluation."
            )

        # PCA scatter for visualization
        pca_scatter = get_pca_scatter_data(pipeline, X_arr, y)

        # Register model
        model_id = f"model-{uuid.uuid4().hex[:8]}"
        version = "v0.1-dev" if is_development_model else f"v{datetime.now(timezone.utc).strftime('%Y%m%d')}"
        trained_at = datetime.now(timezone.utc)

        self.registry.save(
            model_id=model_id,
            pipeline=pipeline,
            version=version,
            food_type=food_type,
            classes=classes,
            dataset_id=dataset_id,
            dataset_label=dataset_label,
            is_development_model=is_development_model,
            metrics=metrics,
            sample_count=len(X_arr),
            pca_components=pca_components,
            svm_kernel=svm_kernel,
            trained_at=trained_at,
        )

        logger.info(
            "ModelTrainer: model %s registered — acc=%.3f (CV %d-fold)",
            model_id, metrics.get("cv_mean_accuracy", 0.0), n_splits,
        )

        return TrainingResult(
            model_id=model_id,
            version=version,
            food_type=food_type,
            classes=classes,
            metrics=metrics,
            is_development_model=is_development_model,
            sample_count=len(X_arr),
            trained_at=trained_at,
            pca_scatter=pca_scatter,
            warnings=warnings,
        )
