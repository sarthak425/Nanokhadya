"""Data source type — determines whether readings come from BLE or development generator."""
from enum import Enum


class DataSourceType(str, Enum):
    BLE = "BLE"
    DEVELOPMENT = "DEVELOPMENT"
