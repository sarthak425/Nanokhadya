# BLE Protocol — NanoTech Food Safety System

## Overview

This document specifies the Bluetooth Low Energy (BLE) communication protocol
between the ESP32 microcontroller and the NanoTech Food Safety System software.

The protocol is versioned. The current version is **v1**.

---

## BLE Architecture

```
AS7265x Multispectral Sensor
         │
      I2C/SPI
         │
       ESP32
         │
    BLE GATT Server
         │ (Bluetooth Low Energy)
         │
   NanoTech Software
   (BleSensorDataSource)
         │
   SensorDataSource
         │
   Application Pipeline
```

---

## GATT Profile

All UUIDs are configurable via `backend/.env`. The values below are
**placeholder UUIDs** — update them when ESP32 firmware is finalized.

```
BLE Service: NanoTech Food Safety
UUID: 12345678-1234-1234-1234-123456789abc
│
├── Characteristic: Sensor Data (NOTIFY + READ)
│   UUID: 12345678-1234-1234-1234-123456789abd
│   Size: 79 bytes (one full spectral packet)
│   Trigger: Per reading acquisition
│
├── Characteristic: Control (WRITE)
│   UUID: 12345678-1234-1234-1234-123456789abe
│   Commands: START_ACQUISITION, STOP_ACQUISITION, RESET
│
└── Characteristic: Status (NOTIFY + READ)
    UUID: 12345678-1234-1234-1234-123456789abf
    Size: Variable (JSON status string)
    Trigger: On state change
```

---

## Packet Format

Each spectral reading is transmitted as a binary packet:

```
Offset  Size  Type    Field
──────  ────  ──────  ─────────────────────────────────────────
0       2     bytes   MAGIC = 0x4E41 ("NA" for NanoTech)
                      0x4653 ("FS" for Food Safety)
2       1     uint8   PROTOCOL_VERSION (current: 0x01)
3       2     uint16  SEQUENCE_NUMBER (little-endian, wraps at 65535)
5       1     uint8   CHANNEL_COUNT (must be 18)
6       72    float32 CHANNEL_VALUES[18] (little-endian IEEE 754)
              × 4     each channel = 4 bytes
78      1     uint8   XOR_CHECKSUM (XOR of all preceding bytes)
──────────────────────────────────────────────────────────────
Total:  79 bytes
```

### Channel Order

Channels are transmitted in wavelength order, matching the AS7265x IC layout:

| Index | IC      | Wavelength (nm) |
|-------|---------|-----------------|
| 0     | AS72653 | 410             |
| 1     | AS72653 | 435             |
| 2     | AS72653 | 460             |
| 3     | AS72653 | 485             |
| 4     | AS72653 | 510             |
| 5     | AS72653 | 535             |
| 6     | AS72652 | 560             |
| 7     | AS72652 | 585             |
| 8     | AS72652 | 610             |
| 9     | AS72652 | 645             |
| 10    | AS72652 | 680             |
| 11    | AS72652 | 705             |
| 12    | AS72651 | 730             |
| 13    | AS72651 | 760             |
| 14    | AS72651 | 810             |
| 15    | AS72651 | 860             |
| 16    | AS72651 | 900             |
| 17    | AS72651 | 940             |

Values are raw AS7265x sensor counts (uint16 from sensor, transmitted as float32).
Typical range: 0 – 65535.

---

## Control Commands

Written to the Control characteristic as a single byte:

| Command             | Byte Value | Description                          |
|---------------------|------------|--------------------------------------|
| START_ACQUISITION   | 0x01       | Begin sensor reading                 |
| STOP_ACQUISITION    | 0x02       | Abort current reading                |
| RESET               | 0xFF       | Reset ESP32 sensor state             |

---

## Status Characteristic

JSON string encoding ESP32 state:

```json
{
  "state": "IDLE | ACQUIRING | READY | ERROR",
  "firmware": "1.0.0",
  "sensor": "AS7265x",
  "channels": 18,
  "temperature": 25.1,
  "errorCode": null
}
```

---

## Connection Sequence

```
Software                    ESP32
   │                          │
   │── BLE SCAN ─────────────►│  (filter: name prefix "NanoTech-FS")
   │◄─ ADVERTISEMENT ─────────│
   │── CONNECT ───────────────►│
   │◄─ GATT DISCOVERY ─────────│
   │── SUBSCRIBE (Sensor) ────►│
   │── SUBSCRIBE (Status) ────►│
   │── WRITE (START) ─────────►│
   │◄─ NOTIFY (Packet) ────────│  (18-channel spectral data)
   │── WRITE (STOP) ──────────►│
   │◄─ NOTIFY (Status: IDLE) ──│
```

---

## Error Handling

The software handles these BLE error conditions:

| Condition               | Software Response                         |
|-------------------------|-------------------------------------------|
| Scan timeout            | Log error, surface to UI                  |
| Device not found        | Retry up to 3 times, then surface error   |
| Connection dropped      | Attempt reconnect, then surface error     |
| Packet too short        | Discard, log PacketParseError             |
| Invalid magic bytes     | Discard, log PacketParseError             |
| Checksum mismatch       | Log warning, attempt parse with warning   |
| Channel count != 18     | Discard, fail validation                  |
| Sensor timeout          | Surface "Sensor Timeout" error to UI      |

---

## UUID Configuration

All UUIDs are configurable in `backend/.env`:

```env
BLE_SERVICE_UUID=12345678-1234-1234-1234-123456789abc
BLE_SENSOR_CHAR_UUID=12345678-1234-1234-1234-123456789abd
BLE_CONTROL_CHAR_UUID=12345678-1234-1234-1234-123456789abe
BLE_STATUS_CHAR_UUID=12345678-1234-1234-1234-123456789abf
```

**These placeholder UUIDs must be replaced with the actual UUIDs
from your ESP32 firmware before connecting real hardware.**

---

## Switching to Real Hardware

1. Flash ESP32 firmware that implements this protocol
2. Update UUIDs in `backend/.env`
3. Set `DATA_SOURCE=BLE` in `backend/.env`
4. Restart the backend
5. Click "Connect" on the Device page

No changes to the ML pipeline, database, preprocessing, or UI are required.
