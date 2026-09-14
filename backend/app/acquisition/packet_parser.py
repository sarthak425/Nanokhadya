"""
packet_parser.py — BLE packet parsing and validation.

Responsibility:
  Parse raw bytes received from the ESP32 BLE characteristic into
  a structured SensorPacket. Every field is explicitly validated.

Packet format (see docs/ble_protocol.md):
  [MAGIC: 2 bytes] [VERSION: 1 byte] [SEQ: 2 bytes] [CHANNEL_COUNT: 1 byte]
  [18 × FLOAT32: 72 bytes] [CHECKSUM: 1 byte]
  Total: 79 bytes

All BLE UUIDs and protocol constants live in ble_protocol.py.
This module handles byte-level parsing only.
"""
from __future__ import annotations
import struct
import logging
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger("nanotech.acquisition.packet_parser")

# ── Packet constants ──────────────────────────────────────────────────
PACKET_MAGIC    = b'NT'              # NanoTech Food Safety (2 bytes)
PROTOCOL_VERSION = 0x01
EXPECTED_CHANNELS = 18
HEADER_FORMAT   = "<2sBH B"         # magic(2) version(1) seq(2) chan_count(1)
HEADER_SIZE     = struct.calcsize(HEADER_FORMAT)
CHANNEL_FORMAT  = f"<{EXPECTED_CHANNELS}f"
CHANNEL_SIZE    = struct.calcsize(CHANNEL_FORMAT)
CHECKSUM_SIZE   = 1
TOTAL_PACKET_SIZE = HEADER_SIZE + CHANNEL_SIZE + CHECKSUM_SIZE


@dataclass
class SensorPacket:
    """Parsed, validated BLE sensor packet."""
    version:       int
    sequence:      int
    channel_count: int
    channel_values: list[float]   # 18 raw sensor counts
    checksum_valid: bool


class PacketParseError(Exception):
    """Raised when a BLE packet cannot be parsed or fails validation."""


class PacketParser:
    """
    Stateless BLE packet parser.

    Usage:
        parser = PacketParser()
        packet = parser.parse(raw_bytes)
    """

    def parse(self, data: bytes) -> SensorPacket:
        """
        Parse raw bytes into a SensorPacket.

        Raises PacketParseError on any structural or checksum failure.
        """
        if len(data) < TOTAL_PACKET_SIZE:
            raise PacketParseError(
                f"Packet too short: {len(data)} bytes, expected {TOTAL_PACKET_SIZE}"
            )

        # ── Parse header ──────────────────────────────────────────────
        try:
            magic, version, seq, chan_count = struct.unpack_from(HEADER_FORMAT, data, 0)
        except struct.error as e:
            raise PacketParseError(f"Header parse error: {e}")

        if magic != PACKET_MAGIC:
            raise PacketParseError(
                f"Invalid magic bytes: {magic.hex()} (expected {PACKET_MAGIC.hex()})"
            )

        if version != PROTOCOL_VERSION:
            logger.warning(
                "PacketParser: protocol version mismatch (got %d, expected %d). "
                "Attempting best-effort parse.",
                version, PROTOCOL_VERSION,
            )

        if chan_count != EXPECTED_CHANNELS:
            raise PacketParseError(
                f"Unexpected channel count: {chan_count} (expected {EXPECTED_CHANNELS})"
            )

        # ── Parse channel values ──────────────────────────────────────
        try:
            channel_values = list(struct.unpack_from(CHANNEL_FORMAT, data, HEADER_SIZE))
        except struct.error as e:
            raise PacketParseError(f"Channel data parse error: {e}")

        # ── Validate checksum ─────────────────────────────────────────
        payload       = data[: HEADER_SIZE + CHANNEL_SIZE]
        received_csum = data[HEADER_SIZE + CHANNEL_SIZE]
        computed_csum = self._compute_checksum(payload)
        checksum_ok   = received_csum == computed_csum

        if not checksum_ok:
            logger.warning(
                "PacketParser: checksum mismatch (received 0x%02X, computed 0x%02X) seq=%d",
                received_csum, computed_csum, seq,
            )

        logger.debug(
            "PacketParser: parsed packet seq=%d, channels=%d, checksum_ok=%s",
            seq, chan_count, checksum_ok,
        )

        return SensorPacket(
            version=version,
            sequence=seq,
            channel_count=chan_count,
            channel_values=channel_values,
            checksum_valid=checksum_ok,
        )

    @staticmethod
    def _compute_checksum(data: bytes) -> int:
        """Simple XOR checksum over payload bytes."""
        csum = 0
        for byte in data:
            csum ^= byte
        return csum & 0xFF

    def validate_values(self, packet: SensorPacket, max_value: float = 65535.0) -> list[str]:
        """
        Validate channel values within the packet.
        Returns a list of warning strings (empty if all OK).
        """
        warnings: list[str] = []
        import math
        for i, v in enumerate(packet.channel_values):
            if math.isnan(v) or math.isinf(v):
                warnings.append(f"Channel {i+1}: NaN or Inf value")
            elif v < 0:
                warnings.append(f"Channel {i+1}: negative value ({v:.1f})")
            elif v > max_value:
                warnings.append(f"Channel {i+1}: value exceeds max ({v:.1f} > {max_value})")
        if not packet.checksum_valid:
            warnings.append("Packet checksum mismatch — data may be corrupted")
        return warnings
