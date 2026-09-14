"""
ML Model Pipeline: StandardScaler → PCA → SVM

This is the actual scikit-learn pipeline used for food safety classification.
Pipeline components are configurable and the full pipeline object is serializable
with joblib for versioned model storage.
"""
from __future__ import annotations
import logging
from typing import Optional

import numpy as np
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV

from app.core.config import settings

logger = logging.getLogger("nanotech.ml.pipeline")


def build_pipeline(
    pca_components: int | None = None,
    svm_kernel: str | None = None,
    svm_c: float = 1.0,
    svm_gamma: str = "scale",
) -> Pipeline:
    """
    Build the StandardScaler → PCA → SVM scikit-learn pipeline.

    Args:
        pca_components: Number of PCA components. None uses min(n_samples-1, n_features).
        svm_kernel: SVM kernel ('rbf', 'linear', 'poly').
        svm_c: SVM regularization parameter.
        svm_gamma: SVM kernel coefficient.

    Returns:
        Unfitted sklearn Pipeline.
    """
    n_components = pca_components or settings.pca_n_components
    kernel = svm_kernel or settings.svm_kernel

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("pca", PCA(n_components=n_components)),
        ("svm", SVC(
            kernel=kernel,
            C=svm_c,
            gamma=svm_gamma,
            probability=True,   # Enables calibrated probability via Platt scaling
            random_state=42,
        )),
    ])

    logger.debug("Built pipeline: scaler → PCA(n=%d) → SVM(kernel=%s, C=%.2f)", n_components, kernel, svm_c)
    return pipeline


def get_pca_scatter_data(
    pipeline: Pipeline,
    X_train: np.ndarray,
    y_train: list[str],
    X_new: Optional[np.ndarray] = None,
) -> dict:
    """
    Extract PCA-projected points for scatter plot visualization.
    Projects training data and optionally a new test sample into PCA space.

    Returns dict with training scatter points and new sample point.
    """
    scaler = pipeline.named_steps["scaler"]
    pca = pipeline.named_steps["pca"]

    X_scaled = scaler.transform(X_train)
    X_pca = pca.transform(X_scaled)

    scatter_points = [
        {"x": float(row[0]), "y": float(row[1]), "label": label}
        for row, label in zip(X_pca, y_train)
    ]

    result = {
        "training_points": scatter_points,
        "explained_variance_ratio": [float(v) for v in pca.explained_variance_ratio_],
        "new_sample": None,
    }

    if X_new is not None:
        X_new_scaled = scaler.transform(X_new)
        X_new_pca = pca.transform(X_new_scaled)
        result["new_sample"] = {
            "x": float(X_new_pca[0, 0]),
            "y": float(X_new_pca[0, 1]),
        }

    return result
