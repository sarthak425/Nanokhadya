"""
ReportService — generates structured text reports for test results.

Reports clearly distinguish:
  - DEVELOPMENT RESULT (synthetic data, unvalidated)
  - EXPERIMENTAL RESULT (real sensor, not yet cross-validated)
  - VALIDATED RESULT    (validated against reference laboratory data)

Per engineering principle: never make unsupported safety claims.
"""
from __future__ import annotations
import json
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.database.models import TestRecord, PredictionRecord
from app.core.config import settings

logger = logging.getLogger("nanotech.services.report")

_DIVIDER = "=" * 60
_SECTION = "-" * 60


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def generate_text_report(self, test_id: str) -> str:
        """
        Generate a full structured text report for a test result.
        Returns the report as a UTF-8 string.
        """
        record: Optional[TestRecord] = self.db.get(TestRecord, test_id)
        if record is None:
            raise ValueError(f"Test '{test_id}' not found.")

        pred: Optional[PredictionRecord] = record.prediction
        is_dev = record.source == "DEVELOPMENT"
        result_type = "DEVELOPMENT RESULT" if is_dev else "EXPERIMENTAL RESULT"

        lines: list[str] = []

        # ── Header ──────────────────────────────────────────────────
        lines += [
            _DIVIDER,
            "  NANOTECH FOOD SAFETY SYSTEM",
            "  Spectral Analysis Report",
            _DIVIDER,
            "",
            f"  ⚠  RESULT TYPE: {result_type}",
        ]
        if is_dev:
            lines += [
                "  This report was generated using DEVELOPMENT (synthetic) data.",
                "  It does NOT represent a real sensor measurement.",
                "  DO NOT use this report for food safety decisions.",
            ]
        else:
            lines += [
                "  This report is based on real AS7265x sensor data.",
                "  Results are EXPERIMENTAL and have not been validated",
                "  against reference laboratory methods.",
                "  DO NOT use this report as a sole food safety determination.",
            ]
        lines += ["", _DIVIDER, ""]

        # ── Test Identification ──────────────────────────────────────
        lines += [
            "TEST IDENTIFICATION",
            _SECTION,
            f"Test ID       : {record.id}",
            f"Timestamp     : {record.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}",
            f"Report Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
            "",
        ]

        # ── Operator & Device ────────────────────────────────────────
        lines += [
            "OPERATOR & DEVICE",
            _SECTION,
            f"Operator ID   : {record.operator_id}",
            f"Operator Name : {record.operator.name if record.operator else '—'}",
            f"Device ID     : {record.device_id}",
            f"Data Source   : {record.source}",
            "",
        ]

        # ── Sample ──────────────────────────────────────────────────
        lines += [
            "SAMPLE",
            _SECTION,
            f"Food Type     : {record.food_type}",
            "",
        ]

        # ── Sensor ──────────────────────────────────────────────────
        lines += [
            "SENSOR",
            _SECTION,
            "Sensor Type   : AMS AS7265x Multispectral Chipset",
            "ICs           : AS72651 + AS72652 + AS72653",
            f"Channels      : {settings.sensor_channel_count} spectral channels",
            "Range         : 410–940 nm (UV / Vis / NIR)",
            "MCU           : ESP32 via Bluetooth Low Energy (BLE)",
            "",
        ]

        # ── Validation ───────────────────────────────────────────────
        warnings: list = []
        if record.validation_warnings:
            try:
                warnings = json.loads(record.validation_warnings)
            except Exception:
                warnings = [record.validation_warnings]

        lines += [
            "DATA VALIDATION",
            _SECTION,
            f"Status        : {record.validation_status}",
        ]
        if warnings:
            lines.append("Warnings:")
            for w in warnings:
                lines.append(f"  • {w}")
        else:
            lines.append("Warnings      : None")
        lines.append("")

        # ── Preprocessing ────────────────────────────────────────────
        steps: list = []
        if record.preprocessing_steps:
            try:
                steps = json.loads(record.preprocessing_steps)
            except Exception:
                steps = [record.preprocessing_steps]

        lines += [
            "PREPROCESSING",
            _SECTION,
        ]
        if steps:
            for s in steps:
                lines.append(f"  • {s}")
        else:
            lines.append("  No preprocessing steps recorded.")
        lines.append("")

        # ── Spectral Data ────────────────────────────────────────────
        lines += [
            "SPECTRAL DATA (18-CHANNEL)",
            _SECTION,
            f"{'Ch':>3}  {'Wavelength':>12}  {'Raw Value':>12}  {'Processed':>12}",
            "-" * 44,
        ]
        raw_channels = record.raw_channels or []
        for ch in raw_channels:
            wl   = ch.get("wavelength", "—")
            raw  = ch.get("rawValue",  "—")
            proc = ch.get("processedValue")
            lines.append(
                f"{ch.get('channel', '?'):>3}  {str(wl)+' nm':>12}  "
                f"{str(round(raw, 2) if isinstance(raw, float) else raw):>12}  "
                f"{str(round(proc, 4) if isinstance(proc, float) else '—'):>12}"
            )
        lines.append("")

        # ── ML Model ────────────────────────────────────────────────
        lines += [
            "MACHINE LEARNING",
            _SECTION,
        ]
        if pred and pred.model:
            m = pred.model
            lines += [
                f"Model ID      : {m.id}",
                f"Model Type    : {m.model_type}",
                f"Model Version : {m.version}",
                f"Food Type     : {m.food_type}",
                f"Pipeline      : StandardScaler → PCA({m.pca_components}) → SVC({m.svm_kernel})",
                f"Trained At    : {m.trained_at.strftime('%Y-%m-%d %H:%M UTC') if m.trained_at else '—'}",
                f"Sample Count  : {m.training_sample_count}",
                f"Dev Model     : {'YES — Not Validated' if m.is_development_model else 'No (Real Dataset)'}",
            ]
            if m.evaluation_metrics:
                metrics = m.evaluation_metrics
                cv_acc = metrics.get("cv_mean_accuracy")
                if cv_acc is not None:
                    lines.append(f"CV Accuracy   : {cv_acc*100:.1f}% ± {metrics.get('cv_std_accuracy',0)*100:.1f}%")
        else:
            lines.append("No ML model information available.")
        lines.append("")

        # ── Prediction ───────────────────────────────────────────────
        lines += [
            "PREDICTION RESULT",
            _SECTION,
        ]
        if pred:
            lines += [
                f"Raw Label     : {pred.raw_label}",
                f"Predicted     : {pred.predicted_label}",
                f"Confidence    : {f'{pred.probability*100:.1f}%' if pred.probability else '—'}",
                f"Confidence Tier: {pred.confidence_tier}",
            ]
            if pred.class_probabilities:
                lines.append("Class Probabilities:")
                for cls, prob in pred.class_probabilities.items():
                    lines.append(f"  {cls:>15}: {prob*100:.1f}%")
        else:
            lines.append("No prediction available.")
        lines.append("")

        # ── Final Result ─────────────────────────────────────────────
        lines += [
            "FINAL RESULT",
            _SECTION,
            f"Result        : {record.final_label or 'UNKNOWN'}",
            f"Possible Issue: {record.possible_issue or 'None identified'}",
            "",
        ]

        # ── Disclaimer ───────────────────────────────────────────────
        lines += [
            _DIVIDER,
            "IMPORTANT DISCLAIMER",
            _SECTION,
            "This report is produced by the NanoTech Food Safety System",
            f"(v{settings.app_version}), an engineering research platform.",
            "",
            "The system's detection capability depends on:",
            "  • Sensor data quality and calibration",
            "  • Sensing chemistry and sample preparation",
            "  • Dataset quality and class balance",
            "  • Model validation against reference laboratory results",
            "",
            "DO NOT use this report as a sole basis for food safety",
            "decisions without independent laboratory verification.",
            _DIVIDER,
            "",
        ]

        return "\n".join(lines)
