"""
SensorDataSource — Abstract base class for all sensor data sources.

This is the most important architectural component in the system.
It defines the contract that both BleSensorDataSource and DevelopmentDataSource must fulfill.

The rest of the application (validation, preprocessing, ML, storage, UI) depends
ONLY on this interface, not on any specific implementation.

When the AS7265x + ESP32 hardware becomes available:
  1. BleSensorDataSource is connected to the actual BLE device.
  2. DevelopmentDataSource remains available for testing.
  3. Nothing else in the application needs to change.
"""
from __future__ import annotations
import abc
import logging
from typing import Optional

from app.domain.models import SensorReading

logger = logging.getLogger("nanotech.hardware")


class SensorDataSource(abc.ABC):
    """
    Abstract interface for all sensor data providers.
    Implementations must be interchangeable without affecting downstream pipeline.
    """

    @abc.abstractmethod
    async def connect(self) -> bool:
        """Establish connection to the data source. Returns True on success."""
        ...

    @abc.abstractmethod
    async def disconnect(self) -> None:
        """Cleanly disconnect from the data source."""
        ...

    @abc.abstractmethod
    def is_connected(self) -> bool:
        """Return current connection state."""
        ...

    @abc.abstractmethod
    async def acquire_reading(
        self,
        test_id: str,
        operator_id: str,
        food_type: str,
        device_id: str,
    ) -> SensorReading:
        """
        Acquire one complete 18-channel spectral reading.

        Implementations must return a SensorReading with exactly 18 SpectralChannel entries.
        The source field must be set to the appropriate DataSourceType.
        """
        ...

    @abc.abstractmethod
    def get_device_info(self) -> dict:
        """Return device metadata (device_id, sensor_type, firmware_version, etc.)."""
        ...

    @abc.abstractmethod
    def get_source_type(self) -> str:
        """Return DataSourceType value string: 'BLE' or 'DEVELOPMENT'."""
        ...
