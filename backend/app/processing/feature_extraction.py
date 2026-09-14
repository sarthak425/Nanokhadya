"""
feature_extraction.py — spectral feature extraction from 18-channel AS7265x data.

Extracts interpretable features from raw spectral data for analysis
and ML pipeline input. These features describe spectral shape,
absorption characteristics, and ratio-based indices.

The ML pipeline (PCA + SVM) uses the raw 18-channel vector directly.
These extracted features are for analysis, reporting, and future
model variants that may benefit from domain-specific features.
"""
from __future__ import annotations
import logging
import numpy as np
from dataclasses import dataclass

from app.core.config import settings

logger = logging.getLogger("nanotech.processing.feature_extraction")

WAVELENGTHS: list[int] = settings.sensor_channel_wavelengths

# AS7265x channel groupings by IC
UV_VIS_CHANNELS  = list(range(0, 6))    # AS72653: 410–535 nm
VIS_NIR_CHANNELS = list(range(6, 12))   # AS72652: 560–705 nm
NIR_CHANNELS     = list(range(12, 18))  # AS72651: 730–940 nm


@dataclass
class SpectralFeatures:
    """Extracted spectral features from one 18-channel reading."""
    # Raw statistics
    total_intensity:    float
    mean_intensity:     float
    std_intensity:      float
    peak_channel:       int       # 1-indexed
    peak_wavelength_nm: int
    peak_value:         float

    # Band ratios (useful for food quality assessment)
    nir_to_vis_ratio:   float    # NIR / Vis+UV power ratio
    uv_fraction:        float    # UV-Vis fraction of total
    nir_fraction:       float    # NIR fraction of total

    # Slope (spectral gradient, indicative of scattering)
    spectral_slope:     float    # linear regression slope across all channels

    # Region means
    mean_uv_vis:        float
    mean_vis_nir:       float
    mean_nir:           float

    def to_dict(self) -> dict:
        return {
            "totalIntensity":   round(self.total_intensity, 2),
            "meanIntensity":    round(self.mean_intensity, 2),
            "stdIntensity":     round(self.std_intensity, 2),
            "peakChannel":      self.peak_channel,
            "peakWavelengthNm": self.peak_wavelength_nm,
            "peakValue":        round(self.peak_value, 2),
            "nirToVisRatio":    round(self.nir_to_vis_ratio, 4),
            "uvFraction":       round(self.uv_fraction, 4),
            "nirFraction":      round(self.nir_fraction, 4),
            "spectralSlope":    round(self.spectral_slope, 6),
            "meanUvVis":        round(self.mean_uv_vis, 2),
            "meanVisNir":       round(self.mean_vis_nir, 2),
            "meanNir":          round(self.mean_nir, 2),
        }


class SpectralFeatureExtractor:
    """
    Extracts interpretable features from an 18-channel AS7265x spectrum.

    These features characterise the spectral fingerprint and are used for:
      - Analysis reports
      - Spectral fingerprint comparisons
      - Future model variants
      - Reference database matching

    The primary ML pipeline (PCA + SVM) operates on the full 18-channel
    vector, not on these extracted features.
    """

    def extract(self, channel_values: list[float]) -> SpectralFeatures:
        """
        Extract features from a 18-channel spectral vector.

        Args:
            channel_values: List of 18 float values (raw or preprocessed)

        Returns:
            SpectralFeatures dataclass
        """
        if len(channel_values) != 18:
            raise ValueError(f"Expected 18 channels, got {len(channel_values)}")

        arr = np.array(channel_values, dtype=float)
        wl  = np.array(WAVELENGTHS, dtype=float)

        # ── Basic statistics ───────────────────────────────────────────
        total  = float(np.sum(arr))
        mean   = float(np.mean(arr))
        std    = float(np.std(arr))

        peak_idx = int(np.argmax(arr))
        peak_val = float(arr[peak_idx])

        # ── Band regions ───────────────────────────────────────────────
        uv_vis  = arr[UV_VIS_CHANNELS]
        vis_nir = arr[VIS_NIR_CHANNELS]
        nir     = arr[NIR_CHANNELS]

        mean_uv_vis  = float(np.mean(uv_vis))
        mean_vis_nir = float(np.mean(vis_nir))
        mean_nir     = float(np.mean(nir))

        # ── Ratios ─────────────────────────────────────────────────────
        vis_sum = float(np.sum(uv_vis) + np.sum(vis_nir))
        nir_sum = float(np.sum(nir))

        nir_to_vis = nir_sum / (vis_sum + 1e-8)
        uv_frac    = float(np.sum(uv_vis)) / (total + 1e-8)
        nir_frac   = nir_sum / (total + 1e-8)

        # ── Spectral slope (linear regression across channels) ─────────
        if len(wl) > 1:
            slope = float(np.polyfit(wl, arr, 1)[0])
        else:
            slope = 0.0

        logger.debug(
            "FeatureExtractor: peak ch%d @%dnm (%.0f), NIR/Vis=%.3f",
            peak_idx + 1, WAVELENGTHS[peak_idx], peak_val, nir_to_vis,
        )

        return SpectralFeatures(
            total_intensity=total,
            mean_intensity=mean,
            std_intensity=std,
            peak_channel=peak_idx + 1,
            peak_wavelength_nm=WAVELENGTHS[peak_idx],
            peak_value=peak_val,
            nir_to_vis_ratio=nir_to_vis,
            uv_fraction=uv_frac,
            nir_fraction=nir_frac,
            spectral_slope=slope,
            mean_uv_vis=mean_uv_vis,
            mean_vis_nir=mean_vis_nir,
            mean_nir=mean_nir,
        )
