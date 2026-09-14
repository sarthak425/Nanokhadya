"""
DevelopmentDataSource — Generates realistic AS7265x-style spectral data.

PURPOSE:
  Enable full pipeline testing without physical hardware.
  Every reading is clearly tagged as source=DEVELOPMENT.
  Development data must NEVER be presented as real sensor measurements.

SPECTRAL PATTERNS:
  Based on approximate NIR/Vis characteristics of food matrices.
  Patterns are structured (not random) to produce separable clusters,
  allowing PCA and SVM to behave realistically during demonstration.
  These patterns are NOT experimentally validated — they exist solely
  to exercise the software pipeline.

WHEN REAL HARDWARE IS AVAILABLE:
  Replace this source with BleSensorDataSource.
  No changes required in any other module.
"""
from __future__ import annotations
import logging
import random
from datetime import datetime, timezone

import numpy as np

from app.core.config import settings
from app.domain.enums import DataSourceType, FoodType
from app.domain.models import SensorReading, SpectralChannel
from app.hardware.sensor_data_source import SensorDataSource

logger = logging.getLogger("nanotech.hardware.development")

# ─────────────────────────────────────────────────────────────────────────────
# AS7265x 18-channel wavelength mapping
# Three ICs: AS72653 (UV/Vis) + AS72652 (Vis/NIR) + AS72651 (NIR)
# ─────────────────────────────────────────────────────────────────────────────
WAVELENGTHS_NM: list[int] = settings.sensor_channel_wavelengths

# ─────────────────────────────────────────────────────────────────────────────
# Spectral base patterns per food type and class.
# Values are approximate 16-bit sensor counts (0–65535 range, typical 500–35000).
# NIR channels (730–940 nm) show elevated response for authentic milk due to
# fat globule scattering — this is the physical basis for the class separation.
# ─────────────────────────────────────────────────────────────────────────────

MILK_PATTERNS: dict[str, list[float]] = {
    # Authentic whole milk: rising NIR response from fat/protein scattering
    "AUTHENTIC": [
        8500, 9200, 10100, 11500, 13200, 15000,   # 410–535 nm
        16800, 18500, 20200, 22500, 24800, 26500,  # 560–705 nm
        28200, 30000, 32500, 31500, 29800, 28000,  # 730–940 nm
    ],
    # Water-adulterated: lower intensity, especially NIR (diluted fat)
    "ADULTERATED": [
        5200, 5700, 6300, 7100, 8200, 9400,        # 410–535 nm
        10600, 11800, 13000, 14800, 16400, 17800,  # 560–705 nm
        19200, 20600, 22000, 21200, 19800, 18500,  # 730–940 nm
    ],
    # Suspected — intermediate pattern with higher variance
    "SUSPECTED": [
        6800, 7400, 8200, 9300, 10700, 12200,      # 410–535 nm
        13700, 15200, 16800, 19000, 21000, 22800,  # 560–705 nm
        24400, 26200, 28200, 27200, 25600, 24000,  # 730–940 nm
    ],
}

COOKING_OIL_PATTERNS: dict[str, list[float]] = {
    "AUTHENTIC": [
        6000, 6500, 7200, 8500, 10000, 11800,
        13500, 15000, 16800, 19000, 21500, 23200,
        25000, 27000, 29500, 28500, 27000, 25500,
    ],
    "ADULTERATED": [
        4000, 4400, 5000, 6000, 7200, 8600,
        10000, 11400, 12800, 14600, 16400, 17900,
        19400, 21000, 23000, 22200, 20800, 19500,
    ],
    "SUSPECTED": [
        5200, 5700, 6400, 7500, 9000, 10600,
        12100, 13600, 15200, 17200, 19400, 21000,
        22700, 24500, 26700, 25800, 24300, 22900,
    ],
}

# Map FoodType to pattern dict
_FOOD_PATTERNS: dict[str, dict] = {
    FoodType.MILK: MILK_PATTERNS,
    FoodType.COOKING_OIL: COOKING_OIL_PATTERNS,
}

# Default noise sigma (sensor counts)
_NOISE_SIGMA: float = 350.0

# Development mode class cycling — rotates through classes on each test call
_CLASS_CYCLE = ["AUTHENTIC", "ADULTERATED", "SUSPECTED"]
_class_counter: int = 0


class DevelopmentDataSource(SensorDataSource):
    """
    Generates realistic synthetic 18-channel spectral readings for pipeline testing.

    All readings are tagged source=DEVELOPMENT.
    This implementation satisfies the SensorDataSource interface identically to
    BleSensorDataSource, so no downstream code changes are needed when switching.
    """

    DEVICE_ID = "DEV-001"
    SENSOR_TYPE = "AS7265x (Development Mode)"

    def __init__(self, noise_sigma: float = _NOISE_SIGMA, seed: int | None = None):
        self._connected = False
        self._noise_sigma = noise_sigma
        self._rng = np.random.default_rng(seed)
        logger.info("DevelopmentDataSource initialised (noise_sigma=%.1f)", noise_sigma)

    # ── SensorDataSource interface ────────────────────────────────────────────

    async def connect(self) -> bool:
        self._connected = True
        logger.info("DevelopmentDataSource: connected (no physical hardware)")
        return True

    async def disconnect(self) -> None:
        self._connected = False
        logger.info("DevelopmentDataSource: disconnected")

    def is_connected(self) -> bool:
        return self._connected

    async def acquire_reading(
        self,
        test_id: str,
        operator_id: str,
        food_type: str,
        device_id: str,
    ) -> SensorReading:
        """
        Generate one realistic 18-channel spectral reading.
        Cycles through AUTHENTIC → ADULTERATED → SUSPECTED classes automatically
        so a demo can show all result types without manual selection.
        """
        global _class_counter

        # Select class (cycles AUTHENTIC → ADULTERATED → SUSPECTED)
        sample_class = _CLASS_CYCLE[_class_counter % len(_CLASS_CYCLE)]
        _class_counter += 1

        base_values = self._get_base_pattern(food_type, sample_class)
        noisy_values = self._add_noise(base_values)

        channels = [
            SpectralChannel(
                index=i,
                wavelength_nm=WAVELENGTHS_NM[i],
                raw_value=max(0.0, noisy_values[i]),
            )
            for i in range(len(WAVELENGTHS_NM))
        ]

        logger.debug(
            "DevelopmentDataSource: generated %s reading for %s [class=%s]",
            food_type, test_id, sample_class,
        )

        return SensorReading(
            test_id=test_id,
            device_id=self.DEVICE_ID,
            operator_id=operator_id,
            food_type=food_type,
            source=DataSourceType.DEVELOPMENT,
            channels=channels,
            timestamp=datetime.now(timezone.utc),
            session_metadata={
                "development_class": sample_class,   # Internal label for pipeline verification
                "note": "DEVELOPMENT DATA — not a real sensor measurement",
            },
        )

    def get_device_info(self) -> dict:
        return {
            "device_id": self.DEVICE_ID,
            "sensor_type": self.SENSOR_TYPE,
            "channel_count": 18,
            "wavelength_range": "410–940 nm",
            "firmware_version": "N/A (development mode)",
            "connection_type": "DEVELOPMENT",
            "warning": "This is a development data source. No physical sensor is connected.",
        }

    def get_source_type(self) -> str:
        return DataSourceType.DEVELOPMENT.value

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _get_base_pattern(self, food_type: str, sample_class: str) -> list[float]:
        """Return base spectral pattern for food type and class."""
        patterns = _FOOD_PATTERNS.get(food_type, MILK_PATTERNS)
        return patterns.get(sample_class, patterns["AUTHENTIC"])

    def _add_noise(self, base: list[float]) -> list[float]:
        """Add Gaussian noise to produce realistic sensor variation."""
        noise = self._rng.normal(0, self._noise_sigma, len(base))
        return [b + n for b, n in zip(base, noise)]

    def generate_training_batch(
        self,
        food_type: str = FoodType.MILK,
        samples_per_class: int = 60,
    ) -> tuple[list[list[float]], list[str]]:
        """
        Generate a labelled batch for ML training.
        Returns (feature_matrix, labels).
        Used by ModelTrainer when no real dataset is available.
        WARNING: Results in a development model only — not for real-world use.
        """
        patterns = _FOOD_PATTERNS.get(food_type, MILK_PATTERNS)
        X, y = [], []
        for label, base in patterns.items():
            for _ in range(samples_per_class):
                noisy = self._add_noise(base)
                X.append([max(0.0, v) for v in noisy])
                y.append(label)
        logger.info(
            "DevelopmentDataSource: generated training batch — %d samples (%d classes)",
            len(X), len(patterns),
        )
        return X, y
