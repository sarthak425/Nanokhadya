"""
normalization.py — spectral normalization methods.

Provides standalone normalization functions used by the preprocessing pipeline.
The actual pipeline calls SpectralPreprocessor (preprocessing.py), which
orchestrates these functions in sequence.

Available methods:
  - SNV (Standard Normal Variate) — primary method
  - Min-Max scaling
  - L2 (unit vector) normalization
"""
from __future__ import annotations
import numpy as np
import logging

logger = logging.getLogger("nanotech.processing.normalization")


def snv(spectrum: np.ndarray) -> np.ndarray:
    """
    Standard Normal Variate (SNV) normalization.

    Subtracts mean and divides by standard deviation.
    This removes multiplicative scatter effects from spectral data,
    which is critical for NIR spectroscopy of food matrices.

    Args:
        spectrum: 1D array of spectral values (18 channels)

    Returns:
        SNV-normalized spectrum
    """
    mean = np.mean(spectrum)
    std  = np.std(spectrum)
    if std < 1e-10:
        logger.warning("normalization.snv: near-zero standard deviation — returning zeros")
        return np.zeros_like(spectrum)
    return (spectrum - mean) / std


def minmax(spectrum: np.ndarray, feature_range: tuple[float, float] = (0.0, 1.0)) -> np.ndarray:
    """
    Min-Max scaling to a specified range.

    Args:
        spectrum:      1D array of spectral values
        feature_range: (min, max) output range

    Returns:
        Scaled spectrum
    """
    lo, hi = feature_range
    mn, mx = spectrum.min(), spectrum.max()
    denom = mx - mn
    if denom < 1e-10:
        logger.warning("normalization.minmax: zero range — returning constant array")
        return np.full_like(spectrum, lo)
    scaled = (spectrum - mn) / denom
    return scaled * (hi - lo) + lo


def l2_normalize(spectrum: np.ndarray) -> np.ndarray:
    """
    L2 (unit vector) normalization.

    Projects the spectrum onto the unit sphere.

    Args:
        spectrum: 1D array of spectral values

    Returns:
        L2-normalized spectrum
    """
    norm = np.linalg.norm(spectrum)
    if norm < 1e-10:
        logger.warning("normalization.l2_normalize: near-zero norm — returning zeros")
        return np.zeros_like(spectrum)
    return spectrum / norm
