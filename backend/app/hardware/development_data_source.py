"""
DevelopmentDataSource — Generates realistic AS7265x-style spectral data.

Strictly modeled for the Universal Food Adulteration Detection Cartridge:
1. Milk
2. Honey
3. Paneer

Simulates the 3-step physical detection mechanism:
1. Nanozymes (chemically functionalized zone catalysts)
2. Chemical mixing (paper microfluidic flow)
3. Colorimetric & spectral reaction across 16 zones + 18 multispectral channels
"""
from __future__ import annotations
import logging
import random
from datetime import datetime, timezone
import numpy as np

from app.core.config import settings
from app.domain.enums import DataSourceType, FoodType
from app.domain.models import SensorReading, SpectralChannel
from app.domain.cartridge_specs import CARTRIDGE_ZONES
from app.hardware.sensor_data_source import SensorDataSource

logger = logging.getLogger("nanotech.hardware.development")

WAVELENGTHS_NM: list[int] = settings.sensor_channel_wavelengths

MILK_PATTERNS: dict[str, list[float]] = {
    "AUTHENTIC": [
        8500, 9200, 10100, 11500, 13200, 15000,   # 410–535 nm (UV/Vis)
        16800, 18500, 20200, 22500, 24800, 26500,  # 560–705 nm (Vis/NIR)
        28200, 30000, 32500, 31500, 29800, 28000,  # 730–940 nm (NIR fat scatter)
    ],
    "ADULTERATED": [
        5200, 5700, 6300, 7100, 8200, 9400,
        14500, 16800, 19000, 17500, 18000, 17800, # Starch/Urea/Detergent reactive dye shifts
        19200, 20600, 22000, 21200, 19800, 18500,
    ],
    "SUSPECTED": [
        6800, 7400, 8200, 9300, 10700, 12200,
        13700, 15200, 16800, 19000, 21000, 22800,
        24400, 26200, 28200, 27200, 25600, 24000,
    ],
}

HONEY_PATTERNS: dict[str, list[float]] = {
    "AUTHENTIC": [
        4200, 4800, 5600, 7200, 9100, 12000,
        15500, 18200, 21500, 24800, 27500, 29000,
        30500, 32000, 33500, 31800, 29200, 26000, # Characteristic high fructose/glucose profile
    ],
    "ADULTERATED": [
        3100, 3600, 4400, 6100, 8200, 10500,
        17200, 22000, 24000, 21500, 23000, 24500, # Added C4 sugar / Rice syrup marker chromogen
        25000, 26500, 28000, 27200, 25800, 29500, # High moisture peak at 940nm
    ],
    "SUSPECTED": [
        3800, 4300, 5100, 6800, 8800, 11400,
        16200, 19800, 22800, 23200, 25400, 27000,
        28200, 29500, 31000, 29800, 27600, 27500,
    ],
}

PANEER_PATTERNS: dict[str, list[float]] = {
    "AUTHENTIC": [
        7800, 8600, 9800, 11200, 12900, 14800,
        16500, 18200, 20400, 23000, 25200, 27100,
        29000, 31200, 33800, 32900, 30800, 28900, # High calcium-protein & dairy fat scatter
    ],
    "ADULTERATED": [
        4800, 5400, 6200, 7800, 9400, 11200,
        15800, 18900, 21200, 18500, 19800, 20500, # Non-dairy protein & starch/vegetable fat shift
        21500, 23200, 25000, 24100, 22800, 21400,
    ],
    "SUSPECTED": [
        6400, 7100, 8100, 9600, 11200, 13100,
        15200, 17200, 19600, 21000, 23100, 24900,
        26400, 28500, 30600, 29700, 27900, 26200,
    ],
}

_FOOD_PATTERNS: dict[str, dict] = {
    FoodType.MILK: MILK_PATTERNS,
    FoodType.HONEY: HONEY_PATTERNS,
    FoodType.PANEER: PANEER_PATTERNS,
}

_NOISE_SIGMA: float = 350.0
_CLASS_CYCLE = ["AUTHENTIC", "ADULTERATED", "SUSPECTED"]
_class_counter: int = 0


class DevelopmentDataSource(SensorDataSource):
    """
    Simulates the Universal 16-Zone Food Adulteration Cartridge + AS7265x multispectral sensor.
    Operates on the 3 primary foods: Milk, Honey, and Paneer.
    """

    DEVICE_ID = "DEV-AS7265X-001"
    SENSOR_TYPE = "AS7265x 18-Channel Triad + 16-Zone Microfluidic Cartridge"

    def __init__(self, noise_sigma: float = _NOISE_SIGMA, seed: int | None = None):
        self._connected = False
        self._noise_sigma = noise_sigma
        self._rng = np.random.default_rng(seed)
        logger.info("DevelopmentDataSource initialized for Milk/Honey/Paneer cartridge (noise_sigma=%.1f)", noise_sigma)

    async def connect(self) -> bool:
        self._connected = True
        logger.info("DevelopmentDataSource connected")
        return True

    async def disconnect(self) -> None:
        self._connected = False
        logger.info("DevelopmentDataSource disconnected")

    def is_connected(self) -> bool:
        return self._connected

    def get_device_info(self) -> dict:
        return {
            "device_id": self.DEVICE_ID,
            "sensor_type": self.SENSOR_TYPE,
            "channel_count": len(WAVELENGTHS_NM),
            "wavelengths_nm": WAVELENGTHS_NM,
            "supported_foods": [FoodType.MILK.value, FoodType.HONEY.value, FoodType.PANEER.value],
            "cartridge_specs": {
                "zones_per_category": 16,
                "reaction_technology": "Nanozymes + Chromogenic Paper Microfluidics",
                "control_zone": 16,
            },
            "source": DataSourceType.DEVELOPMENT.value,
        }

    async def read_spectrum(
        self,
        food_type: FoodType | str = FoodType.MILK,
        intended_class: str | None = None,
    ) -> SensorReading:
        if isinstance(food_type, str):
            try:
                food_type = FoodType(food_type)
            except ValueError:
                food_type = FoodType.MILK

        patterns = _FOOD_PATTERNS.get(food_type, MILK_PATTERNS)

        if intended_class is None:
            global _class_counter
            intended_class = _CLASS_CYCLE[_class_counter % len(_CLASS_CYCLE)]
            _class_counter += 1

        intended_class = intended_class.upper()
        if intended_class not in patterns:
            intended_class = "AUTHENTIC"

        base_values = patterns[intended_class]
        noise = self._rng.normal(0, self._noise_sigma, size=len(base_values))
        channel_values = np.clip(np.array(base_values, dtype=float) + noise, 0, 65535)

        channels = [
            SpectralChannel(
                channel=i + 1,
                wavelength_nm=WAVELENGTHS_NM[i],
                raw_value=float(val),
            )
            for i, val in enumerate(channel_values)
        ]

        logger.debug(
            "Generated %s reading for %s (%s) — noise_sigma=%.1f",
            DataSourceType.DEVELOPMENT.value,
            food_type.value,
            intended_class,
            self._noise_sigma,
        )

        return SensorReading(
            timestamp=datetime.now(timezone.utc),
            channels=channels,
            source=DataSourceType.DEVELOPMENT,
            device_id=self.DEVICE_ID,
            temperature_c=float(round(self._rng.normal(24.5, 0.8), 2)),
            sequence_number=random.randint(1, 65535),
            battery_percent=100,
        )
