"""
BleSensorDataSource — Real BLE communication with ESP32 + AS7265x.

This implementation is active when DATA_SOURCE=BLE in settings.
It uses the 'bleak' library to communicate with the ESP32 over Bluetooth Low Energy.

STATUS: Ready for hardware integration.
The BLE protocol, UUIDs, and packet format are defined in ble_protocol.py.
When the ESP32 firmware is finalized, update the UUIDs in .env and
the packet parser in ble_protocol.py.
"""
from __future__ import annotations
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from app.core.config import settings
from app.domain.enums import DataSourceType
from app.domain.models import SensorReading, SpectralChannel
from app.hardware.sensor_data_source import SensorDataSource
from app.hardware.ble_protocol import BLEPacketParser, SERVICE_UUID, SENSOR_CHAR_UUID

logger = logging.getLogger("nanotech.hardware.ble")

try:
    from bleak import BleakClient, BleakScanner
    from bleak.backends.device import BLEDevice
    BLEAK_AVAILABLE = True
except ImportError:
    BLEAK_AVAILABLE = False
    logger.warning("bleak library not found — BLE source unavailable")


class BleSensorDataSource(SensorDataSource):
    """
    Connects to the NanoTech ESP32 device via BLE and receives AS7265x readings.
    Implements SensorDataSource — fully interchangeable with DevelopmentDataSource.
    """

    def __init__(self):
        if not BLEAK_AVAILABLE:
            raise RuntimeError(
                "bleak library required for BLE mode. Install it with: pip install bleak"
            )
        self._client: Optional[BleakClient] = None
        self._device: Optional[BLEDevice] = None
        self._pending_reading: Optional[SensorReading] = None
        self._notification_event = asyncio.Event()
        self._raw_packet: Optional[bytes] = None
        logger.info("BleSensorDataSource initialised")

    # ── SensorDataSource interface ────────────────────────────────────────────

    async def connect(self) -> bool:
        """Scan for the NanoTech ESP32 device and establish BLE connection."""
        logger.info("BLE: scanning for device with prefix '%s'...", settings.ble_device_name_prefix)
        try:
            device = await BleakScanner.find_device_by_filter(
                lambda d, _: d.name and d.name.startswith(settings.ble_device_name_prefix),
                timeout=settings.ble_scan_timeout_seconds,
            )
            if device is None:
                logger.error("BLE: no device found matching prefix '%s'", settings.ble_device_name_prefix)
                return False

            self._device = device
            self._client = BleakClient(device)
            await asyncio.wait_for(
                self._client.connect(),
                timeout=settings.ble_connection_timeout_seconds,
            )
            logger.info("BLE: connected to %s (%s)", device.name, device.address)
            return True

        except asyncio.TimeoutError:
            logger.error("BLE: connection timed out")
            return False
        except Exception as exc:
            logger.error("BLE: connection error — %s", exc)
            return False

    async def disconnect(self) -> None:
        if self._client and self._client.is_connected:
            await self._client.disconnect()
            logger.info("BLE: disconnected")
        self._client = None
        self._device = None

    def is_connected(self) -> bool:
        return self._client is not None and self._client.is_connected

    async def acquire_reading(
        self,
        test_id: str,
        operator_id: str,
        food_type: str,
        device_id: str,
    ) -> SensorReading:
        """Subscribe to BLE notifications and receive one spectral reading."""
        if not self.is_connected():
            raise RuntimeError("BLE device not connected. Call connect() first.")

        self._notification_event.clear()
        self._raw_packet = None

        await self._client.start_notify(SENSOR_CHAR_UUID, self._on_notification)
        try:
            await asyncio.wait_for(
                self._notification_event.wait(),
                timeout=settings.ble_connection_timeout_seconds,
            )
        finally:
            await self._client.stop_notify(SENSOR_CHAR_UUID)

        if self._raw_packet is None:
            raise RuntimeError("BLE: no data received within timeout")

        return self._parse_packet(self._raw_packet, test_id, operator_id, food_type)

    def get_device_info(self) -> dict:
        if self._device is None:
            return {"status": "not_connected"}
        return {
            "device_id": self._device.address,
            "name": self._device.name,
            "sensor_type": "AS7265x",
            "channel_count": 18,
            "wavelength_range": "410–940 nm",
            "connection_type": "BLE",
            "rssi": getattr(self._device, "rssi", None),
        }

    def get_source_type(self) -> str:
        return DataSourceType.BLE.value

    # ── Internal ──────────────────────────────────────────────────────────────

    def _on_notification(self, sender: int, data: bytearray) -> None:
        """BLE notification callback — receives raw bytes from ESP32."""
        self._raw_packet = bytes(data)
        self._notification_event.set()
        logger.debug("BLE: received notification (%d bytes)", len(data))

    def _parse_packet(
        self, raw: bytes, test_id: str, operator_id: str, food_type: str
    ) -> SensorReading:
        """Parse raw BLE bytes into a SensorReading domain object."""
        packet = BLEPacketParser.parse(raw)
        errors = BLEPacketParser.validate_packet(packet)
        if errors:
            raise ValueError(f"BLE packet validation failed: {errors}")

        channels = [
            SpectralChannel(
                index=i,
                wavelength_nm=ch["wl"],
                raw_value=float(ch["v"]),
            )
            for i, ch in enumerate(packet.channels)
        ]

        return SensorReading(
            test_id=test_id,
            device_id=packet.device_id,
            operator_id=operator_id,
            food_type=food_type,
            source=DataSourceType.BLE,
            channels=channels,
            timestamp=datetime.fromtimestamp(packet.timestamp, tz=timezone.utc),
            temperature_celsius=packet.temperature,
            illumination_level=packet.illumination,
        )
