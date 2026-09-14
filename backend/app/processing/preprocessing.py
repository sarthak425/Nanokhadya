"""
Preprocessing pipeline for spectral sensor data.

The exact preprocessing sequence for real AS7265x measurements will be
determined after collecting real hardware data. This module provides a
configurable, modular pipeline so the sequence can be adjusted without
rewriting downstream code.

Raw sensor values are ALWAYS preserved in PreprocessedData.raw_values.
"""
from __future__ import annotations
import logging

import numpy as np

from app.domain.models import SensorReading, PreprocessedData

logger = logging.getLogger("nanotech.processing.preprocessor")


def _smooth_savgol(values: list[float], window: int = 3, poly: int = 1) -> list[float]:
    """Simple moving-average smoother (fallback if scipy unavailable)."""
    from collections import deque
    if len(values) < window:
        return values
    result = []
    half = window // 2
    for i in range(len(values)):
        lo = max(0, i - half)
        hi = min(len(values), i + half + 1)
        result.append(float(np.mean(values[lo:hi])))
    return result


def _normalize_snv(values: list[float]) -> list[float]:
    """
    Standard Normal Variate (SNV) normalization.
    Removes multiplicative scatter effects from spectral data.
    """
    arr = np.array(values, dtype=float)
    mean = arr.mean()
    std = arr.std()
    if std < 1e-9:
        return values  # Avoid division by zero for flat spectra
    return ((arr - mean) / std).tolist()


def _normalize_minmax(values: list[float]) -> list[float]:
    """Min-max normalization to [0, 1] range."""
    arr = np.array(values, dtype=float)
    mn, mx = arr.min(), arr.max()
    if mx - mn < 1e-9:
        return [0.0] * len(values)
    return ((arr - mn) / (mx - mn)).tolist()


def _baseline_als(values: list[float]) -> list[float]:
    """
    Simple asymmetric least squares baseline correction.
    Subtracts the estimated baseline (minimum rolling window).
    The full ALS implementation requires scipy and will be added when
    real hardware data confirms it is necessary.
    """
    arr = np.array(values, dtype=float)
    # Simple minimum baseline: subtract rolling minimum
    window = max(3, len(arr) // 4)
    baseline = np.array([
        arr[max(0, i - window):i + window + 1].min()
        for i in range(len(arr))
    ])
    corrected = arr - baseline
    corrected = np.clip(corrected, 0, None)
    return corrected.tolist()


class SpectralPreprocessor:
    """
    Configurable spectral preprocessing pipeline.

    Steps:
      1. Noise smoothing (moving average)
      2. Baseline correction (ALS-style)
      3. SNV normalization

    The pipeline is modular — individual steps can be enabled/disabled
    when real hardware data reveals the optimal sequence.
    """

    def __init__(
        self,
        apply_smoothing: bool = True,
        apply_baseline: bool = True,
        normalization: str = "snv",   # "snv" | "minmax" | "none"
    ):
        self.apply_smoothing = apply_smoothing
        self.apply_baseline = apply_baseline
        self.normalization = normalization

    def process(self, reading: SensorReading) -> PreprocessedData:
        raw = [ch.raw_value for ch in reading.channels]
        steps: list[str] = ["raw_extraction"]
        current = list(raw)

        if self.apply_smoothing:
            current = _smooth_savgol(current, window=3)
            steps.append("smoothing_mov_avg_w3")

        if self.apply_baseline:
            current = _baseline_als(current)
            steps.append("baseline_correction_als")

        baseline_corrected = list(current)

        if self.normalization == "snv":
            current = _normalize_snv(current)
            steps.append("normalization_snv")
        elif self.normalization == "minmax":
            current = _normalize_minmax(current)
            steps.append("normalization_minmax")
        else:
            steps.append("normalization_none")

        normalized = list(current)

        # Update processed_value on channels
        for i, ch in enumerate(reading.channels):
            ch.processed_value = normalized[i] if i < len(normalized) else None

        logger.debug("Preprocessing complete for %s — steps: %s", reading.test_id, steps)

        return PreprocessedData(
            reading=reading,
            raw_values=raw,
            normalized_values=normalized,
            baseline_corrected=baseline_corrected,
            feature_vector=normalized,
            preprocessing_steps=steps,
        )
