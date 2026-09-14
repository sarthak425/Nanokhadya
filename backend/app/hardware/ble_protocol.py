"""
BLE Protocol Definition for NanoTech ESP32 Firmware Communication.

All BLE UUIDs, characteristic definitions, and packet format are
defined here — in one place — so changes to firmware are isolated.

IMPORTANT: The UUIDs below are placeholders until the ESP32 firmware
is finalized. Update this file when the firmware team finalizes the UUIDs.
Do not scatter BLE UUIDs throughout the application.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
import struct
import json

from app.core.config import settings

# ─────────────────────────────────────────────────────────────────────────────
# BLE Service & Characteristic UUIDs
# Source: settings (loaded from .env — update when firmware finalizes these)
# ─────────────────────────────────────────────────────────────────────────────

SERVICE_UUID = settings.ble_service_uuid
SENSOR_CHAR_UUID = settings.ble_sensor_char_uuid
CONTROL_CHAR_UUID = settings.ble_control_char_uuid
STATUS_CHAR_UUID = settings.ble_status_char_uuid

# ─────────────────────────────────────────────────────────────────────────────
# Packet Format v1
#
# The ESP32 transmits a JSON-encoded packet over BLE notification:
#
# {
#   "v":  1,              // Protocol version
#   "did": "FS-001",      // Device ID
#   "tid": "T001",        // Test/session ID
#   "ts":  1726165200,    // Unix timestamp
#   "ch": [               // 18 channel readings
#     {"wl": 410, "v": 12345},
#     {"wl": 435, "v": 14567},
#     ...
#   ],
#   "t":  25.3,           // Temperature °C (optional)
#   "ill": 100.0          // Illumination level (optional)
# }
#
# Alternative: binary format (more BLE-efficient, may be implemented later)
# struct format: <H B H 18H f f  (version, device_id_len, test_id, 18x uint16, temp, illumination)
# ─────────────────────────────────────────────────────────────────────────────

PROTOCOL_VERSION = 1
EXPECTED_CHANNEL_COUNT = 18


@dataclass
class BLEPacket:
    """Parsed BLE packet received from ESP32."""
    protocol_version: int
    device_id: str
    test_id: str
    timestamp: int
    channels: list[dict]      # [{"wl": int, "v": float}]
    temperature: Optional[float] = None
    illumination: Optional[float] = None


class BLEPacketParser:
    """
    Parses raw BLE notification bytes into BLEPacket objects.
    Validates structure and protocol version before returning a packet.
    """

    @staticmethod
    def parse(raw_bytes: bytes) -> BLEPacket:
        """
        Parse a raw BLE notification payload into a BLEPacket.
        Raises ValueError on malformed or unsupported packets.
        """
        try:
            text = raw_bytes.decode("utf-8")
            data = json.loads(text)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError(f"BLE packet is not valid UTF-8 JSON: {exc}") from exc

        version = data.get("v")
        if version != PROTOCOL_VERSION:
            raise ValueError(
                f"Unsupported BLE protocol version {version!r}. Expected {PROTOCOL_VERSION}."
            )

        channels = data.get("ch", [])
        if len(channels) != EXPECTED_CHANNEL_COUNT:
            raise ValueError(
                f"Expected {EXPECTED_CHANNEL_COUNT} channels, got {len(channels)}."
            )

        return BLEPacket(
            protocol_version=version,
            device_id=data.get("did", "UNKNOWN"),
            test_id=data.get("tid", "UNKNOWN"),
            timestamp=data.get("ts", 0),
            channels=channels,
            temperature=data.get("t"),
            illumination=data.get("ill"),
        )

    @staticmethod
    def validate_packet(packet: BLEPacket) -> list[str]:
        """Return list of validation errors, empty if packet is clean."""
        errors = []
        for i, ch in enumerate(packet.channels):
            if "wl" not in ch or "v" not in ch:
                errors.append(f"Channel {i} missing 'wl' or 'v' field.")
            elif not isinstance(ch["v"], (int, float)):
                errors.append(f"Channel {i} value is not numeric: {ch['v']!r}")
        return errors
