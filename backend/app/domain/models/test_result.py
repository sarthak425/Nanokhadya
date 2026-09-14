"""Prediction and final test result domain models."""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from app.domain.enums import PredictionLabel, ResultConfidence, ValidationStatus


@dataclass
class ModelMetadata:
    """Identifies exactly which model version produced a result."""
    model_id: str
    model_type: str          # e.g. "SVM"
    model_version: str       # e.g. "v0.1-dev"
    dataset_id: Optional[str] = None
    dataset_label: Optional[str] = None
    food_type: Optional[str] = None
    is_development_model: bool = True
    trained_at: Optional[datetime] = None


@dataclass
class PCAResult:
    """Output of PCA dimensionality reduction."""
    components: list[float]            # Projected coordinates (PC1, PC2, ...)
    explained_variance_ratio: list[float]
    n_components_used: int
    training_scatter: Optional[list[dict]] = None  # {x, y, label} points for chart


@dataclass
class PredictionResult:
    """
    Raw output from the SVM classifier.
    Kept separate from TestResult so the result engine applies business logic.
    """
    raw_label: str                        # Class label as returned by model
    predicted_label: PredictionLabel
    probability: Optional[float]          # None if model does not support probability
    confidence_tier: ResultConfidence
    class_probabilities: Optional[dict[str, float]] = None  # All class probabilities
    model_metadata: Optional[ModelMetadata] = None
    warnings: list[str] = field(default_factory=list)


@dataclass
class TestResult:
    """
    The complete, traceable result of one food safety test.
    Stored in the database and returned to the UI.
    """
    test_id: str
    device_id: str
    operator_id: str
    food_type: str
    source: str                          # DataSourceType value
    timestamp: datetime

    # Spectral data
    raw_channels: list[dict]            # [{wavelength, raw_value, processed_value}]

    # Processing
    preprocessing_steps: list[str]
    validation_status: ValidationStatus
    validation_warnings: list[str]

    # ML
    pca_result: Optional[PCAResult]
    prediction: Optional[PredictionResult]

    # Final result
    final_label: PredictionLabel
    possible_issue: Optional[str]

    # Traceability
    model_metadata: Optional[ModelMetadata]

    @property
    def is_development_result(self) -> bool:
        return self.source == "DEVELOPMENT"
