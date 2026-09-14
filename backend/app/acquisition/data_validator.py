"""Data validation for incoming sensor readings."""
from __future__ import annotations
import logging
import math

from app.core.config import settings
from app.domain.enums import ValidationStatus
from app.domain.models import SensorReading, ValidationResult

logger = logging.getLogger("nanotech.acquisition.validator")

# Spike detection threshold: a channel value more than N × median is suspicious
SPIKE_MULTIPLIER = 5.0


class DataValidator:
    """
    Validates 18-channel spectral readings before entering the ML pipeline.
    All checks are explicit and logged — silent data corruption is never allowed.
    """

    def validate(self, reading: SensorReading) -> ValidationResult:
        errors: list[str] = []
        warnings: list[str] = []

        # 1. Channel count
        if len(reading.channels) != settings.sensor_channel_count:
            errors.append(
                f"Expected {settings.sensor_channel_count} channels, "
                f"got {len(reading.channels)}."
            )

        # 2. Wavelength mapping
        expected = settings.sensor_channel_wavelengths
        for i, ch in enumerate(reading.channels):
            if i < len(expected) and ch.wavelength_nm != expected[i]:
                warnings.append(
                    f"Channel {i}: expected {expected[i]} nm, got {ch.wavelength_nm} nm."
                )

        # 3. Value range, NaN, Inf
        raw_values: list[float] = []
        for ch in reading.channels:
            v = ch.raw_value
            if not isinstance(v, (int, float)):
                errors.append(f"Channel {ch.index} ({ch.wavelength_nm} nm): non-numeric value {v!r}")
                continue
            if math.isnan(v):
                errors.append(f"Channel {ch.index} ({ch.wavelength_nm} nm): NaN value")
                continue
            if math.isinf(v):
                errors.append(f"Channel {ch.index} ({ch.wavelength_nm} nm): infinite value")
                continue
            if v < settings.sensor_value_min or v > settings.sensor_value_max:
                warnings.append(
                    f"Channel {ch.index} ({ch.wavelength_nm} nm): value {v:.1f} "
                    f"outside expected range [{settings.sensor_value_min}, {settings.sensor_value_max}]"
                )
            raw_values.append(v)

        # 4. Spike detection (only if we have valid values)
        if len(raw_values) >= 3:
            import statistics
            median = statistics.median(raw_values)
            if median > 0:
                for ch in reading.channels:
                    if ch.raw_value > SPIKE_MULTIPLIER * median:
                        warnings.append(
                            f"Channel {ch.index} ({ch.wavelength_nm} nm): "
                            f"possible spike ({ch.raw_value:.1f} vs median {median:.1f})"
                        )

        # 5. All-zero check
        if raw_values and all(v == 0.0 for v in raw_values):
            errors.append("All channel values are zero — sensor may not be connected or reading failed.")

        # Determine status
        if errors:
            status = ValidationStatus.INVALID
        elif warnings:
            status = ValidationStatus.WARNING
        else:
            status = ValidationStatus.VALID

        result = ValidationResult(
            status=status,
            errors=errors,
            warnings=warnings,
            channel_count=len(reading.channels),
        )

        if errors:
            logger.warning("Validation FAILED for %s: %s", reading.test_id, errors)
        elif warnings:
            logger.warning("Validation WARNING for %s: %s", reading.test_id, warnings)
        else:
            logger.debug("Validation PASSED for %s", reading.test_id)

        return result
