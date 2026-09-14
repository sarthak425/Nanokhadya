"""
DeviceManager — manages the active SensorDataSource instance.

Selects BLE or Development source based on settings.data_source.
Provides a single application-level sensor access point.
"""
from __future__ import annotations
import logging

from app.core.config import settings
from app.hardware.sensor_data_source import SensorDataSource

logger = logging.getLogger("nanotech.hardware.device_manager")

_active_source: SensorDataSource | None = None


def get_sensor_source() -> SensorDataSource:
    """Return the active sensor data source (singleton per application run)."""
    global _active_source
    if _active_source is None:
        _active_source = _create_source()
    return _active_source


def _create_source() -> SensorDataSource:
    if settings.data_source == "BLE":
        logger.info("DeviceManager: creating BleSensorDataSource")
        from app.hardware.ble_sensor_data_source import BleSensorDataSource
        return BleSensorDataSource()
    else:
        logger.info("DeviceManager: creating DevelopmentDataSource")
        from app.hardware.development_data_source import DevelopmentDataSource
        return DevelopmentDataSource()


async def connect_source() -> bool:
    source = get_sensor_source()
    return await source.connect()


async def disconnect_source() -> None:
    source = get_sensor_source()
    await source.disconnect()
