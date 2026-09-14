"""Food type classifications supported by the system."""
from enum import Enum


class FoodType(str, Enum):
    MILK = "Milk"
    COOKING_OIL = "Cooking Oil"
    SPICE = "Spice"
    HONEY = "Honey"
    OTHER = "Other"

    @classmethod
    def values(cls) -> list[str]:
        return [m.value for m in cls]
