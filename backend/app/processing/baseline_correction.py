"""
baseline_correction.py — spectral baseline correction methods.

Provides standalone baseline correction functions used by the
preprocessing pipeline.

Available methods:
  - ALS (Asymmetric Least Squares) — primary method for NIR spectra
  - Linear baseline subtraction
  - Rubberband correction
"""
from __future__ import annotations
import logging
import numpy as np
from scipy import sparse
from scipy.sparse.linalg import spsolve

logger = logging.getLogger("nanotech.processing.baseline_correction")


def als_baseline(
    spectrum: np.ndarray,
    lam: float = 1e4,
    p: float = 0.01,
    n_iter: int = 10,
) -> np.ndarray:
    """
    Asymmetric Least Squares (ALS) baseline correction.

    Estimates a smooth baseline and subtracts it from the spectrum.
    Well-suited for NIR spectra with broad background fluorescence.

    Reference: Eilers & Boelens (2005). "Baseline Correction with
    Asymmetric Least Squares Smoothing."

    Args:
        spectrum: 1D array of raw spectral values
        lam:      Smoothness parameter (larger = smoother baseline)
        p:        Asymmetry parameter (0 < p < 1; small for NIR)
        n_iter:   Number of reweighting iterations

    Returns:
        Baseline-corrected spectrum (original minus estimated baseline)
    """
    L = len(spectrum)
    D = sparse.diags([1, -2, 1], [0, 1, 2], shape=(L - 2, L))
    w = np.ones(L)
    baseline = np.zeros(L)

    for _ in range(n_iter):
        W   = sparse.diags(w, 0)
        Z   = W + lam * D.T @ D
        baseline = spsolve(Z, w * spectrum)
        w = np.where(spectrum > baseline, p, 1 - p)

    corrected = spectrum - baseline
    logger.debug("als_baseline: baseline range [%.1f, %.1f]", baseline.min(), baseline.max())
    return corrected


def linear_baseline(spectrum: np.ndarray) -> np.ndarray:
    """
    Simple linear baseline correction.

    Subtracts a straight line connecting the first and last spectral points.

    Args:
        spectrum: 1D array of spectral values

    Returns:
        Baseline-corrected spectrum
    """
    n = len(spectrum)
    baseline = np.linspace(spectrum[0], spectrum[-1], n)
    return spectrum - baseline


def rubberband(spectrum: np.ndarray, wavelengths: np.ndarray | None = None) -> np.ndarray:
    """
    Rubberband (convex hull) baseline correction.

    Fits a lower convex hull beneath the spectrum and subtracts it.
    Useful for removing broad fluorescent backgrounds.

    Args:
        spectrum:    1D array of spectral values
        wavelengths: Optional x-axis (indices used if not provided)

    Returns:
        Baseline-corrected spectrum
    """
    n = len(spectrum)
    x = wavelengths if wavelengths is not None else np.arange(n, dtype=float)

    # Build convex hull of (x, -spectrum) to get lower envelope
    from scipy.spatial import ConvexHull
    pts = np.column_stack([x, spectrum])
    try:
        hull = ConvexHull(pts)
        hull_pts = pts[np.sort(hull.vertices)]
        baseline = np.interp(x, hull_pts[:, 0], hull_pts[:, 1])
        return spectrum - baseline
    except Exception as e:
        logger.warning("rubberband: convex hull failed (%s), falling back to linear", e)
        return linear_baseline(spectrum)
