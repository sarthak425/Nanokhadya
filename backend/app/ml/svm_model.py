"""
svm_model.py — SVM classifier wrapper for food adulteration detection.

Provides a documented SVM wrapper with AS7265x-specific helpers.

The full sklearn pipeline (StandardScaler → PCA → SVC) lives in
model_pipeline.py. This module provides standalone SVM configuration
and probability calibration utilities.
"""
from __future__ import annotations
import logging
import numpy as np
from dataclasses import dataclass
from typing import Optional

from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV

logger = logging.getLogger("nanotech.ml.svm_model")

# Recommended kernels for spectral classification
SUPPORTED_KERNELS = {"rbf", "linear", "poly", "sigmoid"}


@dataclass
class SVMPrediction:
    """Result from SVM classification."""
    predicted_class:     str
    probability:         Optional[float]   # P(predicted_class) — None if not available
    class_probabilities: Optional[dict[str, float]]
    decision_values:     Optional[dict[str, float]]


class SpectralSVM:
    """
    SVM classifier for 18-channel spectral food adulteration detection.

    Wraps sklearn's SVC with probability calibration (Platt scaling).

    Key design decisions:
      - RBF kernel: default, handles non-linear spectral class boundaries
      - probability=True: required for confidence tier calculation
      - Probability calibration via CalibratedClassifierCV when sample
        counts are insufficient for built-in Platt scaling

    In production, SVM is embedded in the full sklearn Pipeline.
    This class is used for configuration and analysis documentation.
    """

    def __init__(
        self,
        kernel: str = "rbf",
        C: float = 1.0,
        gamma: str = "scale",
        probability: bool = True,
    ):
        if kernel not in SUPPORTED_KERNELS:
            raise ValueError(f"Unsupported kernel '{kernel}'. Choose from {SUPPORTED_KERNELS}")

        self.kernel = kernel
        self.C      = C
        self.gamma  = gamma
        self._model = SVC(
            kernel=kernel,
            C=C,
            gamma=gamma,
            probability=probability,
            class_weight="balanced",  # handles imbalanced datasets
            random_state=42,
        )
        self._classes: list[str] = []
        self._fitted = False

    def fit(self, X: np.ndarray, y: list[str]) -> "SpectralSVM":
        """
        Train the SVM on preprocessed spectral data.

        Args:
            X: shape (n_samples, n_features) — PCA-reduced or raw features
            y: class labels (AUTHENTIC, ADULTERATED, SUSPECTED, etc.)

        Returns:
            self
        """
        self._model.fit(X, y)
        self._classes = list(self._model.classes_)
        self._fitted  = True
        logger.info(
            "SpectralSVM: trained on %d samples, classes=%s, kernel=%s, C=%.2f",
            X.shape[0], self._classes, self.kernel, self.C,
        )
        return self

    def predict(self, X: np.ndarray) -> SVMPrediction:
        """
        Predict class and probabilities for one sample.

        Args:
            X: shape (1, n_features) or (n_features,)

        Returns:
            SVMPrediction
        """
        if not self._fitted:
            raise RuntimeError("SpectralSVM: must call fit() before predict()")

        X_2d = X.reshape(1, -1) if X.ndim == 1 else X
        predicted = self._model.predict(X_2d)[0]

        proba_dict: Optional[dict[str, float]] = None
        probability: Optional[float] = None

        if hasattr(self._model, "predict_proba"):
            probas = self._model.predict_proba(X_2d)[0]
            proba_dict = {cls: float(p) for cls, p in zip(self._classes, probas)}
            probability = proba_dict.get(predicted)

        return SVMPrediction(
            predicted_class=predicted,
            probability=probability,
            class_probabilities=proba_dict,
            decision_values=None,  # decision_function not used when probability=True
        )

    @property
    def classes(self) -> list[str]:
        return self._classes

    def get_config(self) -> dict:
        """Return model hyperparameter configuration."""
        return {
            "kernel":  self.kernel,
            "C":       self.C,
            "gamma":   self.gamma,
            "classes": self._classes,
        }
