"""
Domain Models — Core data structures.
These are pure Python dataclasses / Pydantic models used throughout the pipeline.
They are NOT SQLAlchemy ORM models (those live in database/models.py).
"""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
import uuid

from app.domain.enums import DataSourceType, FoodType, ValidationStatus


@dataclass
class SpectralChannel:
    """Represents one channel of the AS7265x sensor."""
    index: int           # 0-based channel index
    wavelength_nm: int   # Nominal wavelength in nanometers
    raw_value: float     # Raw ADC reading from sensor
    processed_value: Optional[float] = None  # Value after preprocessing


@dataclass
class SensorReading:
    """
    A complete 18-channel spectral measurement from the AS7265x.

    This is the primary unit of data flowing through the pipeline.
    The source field records whether it originated from real BLE hardware
    or the development data generator — allowing the rest of the pipeline
    to remain source-agnostic.
    """
    test_id: str
    device_id: str
    operator_id: str
    food_type: FoodType
    source: DataSourceType
    channels: list[SpectralChannel]  # Must contain exactly 18 entries
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    temperature_celsius: Optional[float] = None
    illumination_level: Optional[float] = None
    session_metadata: dict = field(default_factory=dict)

    def channel_raw_values(self) -> list[float]:
        return [ch.raw_value for ch in self.channels]

    def channel_wavelengths(self) -> list[int]:
        return [ch.wavelength_nm for ch in self.channels]

    @classmethod
    def generate_test_id(cls) -> str:
        return f"FS-{uuid.uuid4().hex[:8].upper()}"


@dataclass
class ValidationResult:
    """Result of validating a SensorReading before it enters the ML pipeline."""
    status: ValidationStatus
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    channel_count: int = 0

    @property
    def is_valid(self) -> bool:
        return self.status != ValidationStatus.INVALID

    @property
    def has_warnings(self) -> bool:
        return bool(self.warnings)


@dataclass
class PreprocessedData:
    """Output of the preprocessing pipeline."""
    reading: SensorReading
    raw_values: list[float]           # Original values preserved
    normalized_values: list[float]    # After normalization
    baseline_corrected: list[float]   # After baseline correction
    feature_vector: list[float]       # Final ML-ready feature vector
    preprocessing_steps: list[str] = field(default_factory=list)

    def to_numpy(self):
        import numpy as np
        return np.array(self.feature_vector).reshape(1, -1)
