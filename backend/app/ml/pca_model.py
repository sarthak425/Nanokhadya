"""
pca_model.py — PCA wrapper for spectral dimensionality reduction and visualization.

Provides a thin, documented wrapper around sklearn's PCA with
AS7265x-specific helpers for scatter plot generation and
explained variance reporting.

The full sklearn pipeline (StandardScaler → PCA → SVC) lives in
model_pipeline.py. This module provides standalone PCA utilities
for visualization and analysis.
"""
from __future__ import annotations
import logging
import numpy as np
from dataclasses import dataclass
from typing import Optional

from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger("nanotech.ml.pca_model")


@dataclass
class PCAProjection:
    """Result of projecting samples through PCA."""
    components:              np.ndarray   # shape (n_samples, n_components)
    explained_variance_ratio: list[float]
    loadings:                np.ndarray   # shape (n_components, n_features)
    n_components:            int


class SpectralPCA:
    """
    PCA model for 18-channel AS7265x spectral data.

    Wraps sklearn PCA with:
      - StandardScaler (zero mean, unit variance) pre-processing
      - Explained variance reporting
      - Training scatter plot generation
      - New sample projection

    Note: In production, PCA is embedded in the full sklearn Pipeline
    (model_pipeline.py). This class is used for standalone analysis
    and visualization outside the training workflow.
    """

    def __init__(self, n_components: int = 2):
        self.n_components = n_components
        self._scaler = StandardScaler()
        self._pca    = PCA(n_components=n_components, random_state=42)
        self._fitted = False

    def fit(self, X: np.ndarray) -> "SpectralPCA":
        """
        Fit StandardScaler + PCA on a feature matrix.

        Args:
            X: shape (n_samples, 18) — raw spectral features

        Returns:
            self (for chaining)
        """
        X_scaled = self._scaler.fit_transform(X)
        self._pca.fit(X_scaled)
        self._fitted = True
        logger.info(
            "SpectralPCA: fitted on %d samples, explained variance: %s",
            X.shape[0],
            [f"{v*100:.1f}%" for v in self._pca.explained_variance_ratio_],
        )
        return self

    def transform(self, X: np.ndarray) -> PCAProjection:
        """
        Project samples into PCA space.

        Args:
            X: shape (n_samples, 18)

        Returns:
            PCAProjection with components and metadata
        """
        if not self._fitted:
            raise RuntimeError("SpectralPCA: must call fit() before transform()")
        X_scaled    = self._scaler.transform(X)
        components  = self._pca.transform(X_scaled)
        return PCAProjection(
            components=components,
            explained_variance_ratio=self._pca.explained_variance_ratio_.tolist(),
            loadings=self._pca.components_,
            n_components=self.n_components,
        )

    def fit_transform(self, X: np.ndarray) -> PCAProjection:
        """Fit and transform in one step."""
        self.fit(X)
        return self.transform(X)

    def build_scatter(
        self,
        X_train: np.ndarray,
        y_train: list[str],
        new_sample: Optional[np.ndarray] = None,
    ) -> dict:
        """
        Build a PCA scatter plot data structure for the UI.

        Returns a dict with:
          - training_points: list of {x, y, label}
          - new_sample:      {x, y} if provided
          - explained_variance_ratio: list of floats
        """
        proj = self.fit_transform(X_train)
        training_points = [
            {"x": float(pt[0]), "y": float(pt[1]), "label": lbl}
            for pt, lbl in zip(proj.components, y_train)
        ]
        result: dict = {
            "training_points": training_points,
            "explained_variance_ratio": proj.explained_variance_ratio,
        }
        if new_sample is not None:
            new_scaled = self._scaler.transform(new_sample.reshape(1, -1))
            new_proj   = self._pca.transform(new_scaled)[0]
            result["new_sample"] = {"x": float(new_proj[0]), "y": float(new_proj[1])}

        return result
