"""
NanoTech Food Safety System — Core Configuration
-------------------------------------------------
All application settings are read from environment variables or .env file.
This is the single source of truth for configuration.
"""
import os
from pathlib import Path
from typing import Literal
from dotenv import load_dotenv
from pydantic import BaseModel, field_validator

# Load .env if present
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()


class Settings(BaseModel):
    # ── Application ──────────────────────────────────────────────
    app_name: str = os.getenv("APP_NAME", "NanoTech Food Safety System")
    app_version: str = os.getenv("APP_VERSION", "0.1.0")
    debug: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    # ── Data Source ───────────────────────────────────────────────
    # Switch between BLE (real hardware) and DEVELOPMENT (synthetic data).
    # Only this setting changes when real hardware is connected.
    data_source: Literal["BLE", "DEVELOPMENT"] = os.getenv("DATA_SOURCE", "DEVELOPMENT").upper()  # type: ignore

    # ── BLE Configuration (active when data_source=BLE) ──────────
    ble_device_name_prefix: str = os.getenv("BLE_DEVICE_NAME_PREFIX", "NanoTech-FS")
    ble_service_uuid: str = os.getenv("BLE_SERVICE_UUID", "12345678-1234-1234-1234-123456789abc")
    ble_sensor_char_uuid: str = os.getenv("BLE_SENSOR_CHAR_UUID", "12345678-1234-1234-1234-123456789abd")
    ble_control_char_uuid: str = os.getenv("BLE_CONTROL_CHAR_UUID", "12345678-1234-1234-1234-123456789abe")
    ble_status_char_uuid: str = os.getenv("BLE_STATUS_CHAR_UUID", "12345678-1234-1234-1234-123456789abf")
    ble_scan_timeout_seconds: int = int(os.getenv("BLE_SCAN_TIMEOUT_SECONDS", "10"))
    ble_connection_timeout_seconds: int = int(os.getenv("BLE_CONNECTION_TIMEOUT_SECONDS", "15"))

    # ── Database ──────────────────────────────────────────────────
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/nanotech.db")

    # ── Storage Paths ─────────────────────────────────────────────
    model_storage_path: str = os.getenv("MODEL_STORAGE_PATH", "./data/models")
    dataset_storage_path: str = os.getenv("DATASET_STORAGE_PATH", "./data/datasets")

    # ── Sensor Specification (AS7265x) ───────────────────────────
    # 18 spectral channels covering 410–940 nm
    sensor_channel_count: int = 18
    sensor_channel_wavelengths: list[int] = [
        410, 435, 460, 485, 510, 535,   # AS72653 — UV/Visible
        560, 585, 610, 645, 680, 705,   # AS72652 — Visible/NIR
        730, 760, 810, 860, 900, 940,   # AS72651 — NIR
    ]
    # AS7265x typical 12-bit ADC range
    sensor_value_min: float = 0.0
    sensor_value_max: float = 65535.0  # 16-bit output register

    # ── ML ────────────────────────────────────────────────────────
    pca_n_components: int = int(os.getenv("PCA_N_COMPONENTS", "2"))
    svm_kernel: str = os.getenv("SVM_KERNEL", "rbf")
    svm_probability: bool = True       # Platt scaling for calibrated probabilities

    @field_validator("model_storage_path", "dataset_storage_path", mode="before")
    @classmethod
    def ensure_path_exists(cls, v: str) -> str:
        Path(v).mkdir(parents=True, exist_ok=True)
        return v


# Global singleton — import this everywhere
settings = Settings()
