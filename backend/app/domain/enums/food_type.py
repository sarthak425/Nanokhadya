"""
Food type classifications supported by the system.
Strictly configured for the Universal Food Adulteration Detection Cartridge:
1. Milk
2. Honey
3. Paneer
"""
from enum import Enum


class FoodType(str, Enum):
    MILK = "Milk"
    HONEY = "Honey"
    PANEER = "Paneer"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]
