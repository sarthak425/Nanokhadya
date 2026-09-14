"""
analysis_service.py — spectral analysis and fingerprint comparison.

Provides:
  - Spectral feature extraction for a test record
  - Reference fingerprint comparison (architectural stub for §24)
  - Batch analysis across test history

This service is architecturally ready for a future reference
spectral database. Currently returns extracted features only.
"""
from __future__ import annotations
import json
import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.database.models import TestRecord
from app.processing.feature_extraction import SpectralFeatureExtractor

logger = logging.getLogger("nanotech.services.analysis")

_extractor = SpectralFeatureExtractor()


class AnalysisService:
    def __init__(self, db: Session):
        self.db = db

    def get_spectral_features(self, test_id: str) -> dict:
        """
        Extract and return spectral features for a test record.

        Features include band ratios, peak wavelength, NIR/Vis ratio,
        and spectral slope — useful for reporting and comparison.
        """
        record: Optional[TestRecord] = self.db.get(TestRecord, test_id)
        if record is None:
            raise ValueError(f"Test '{test_id}' not found.")

        raw_channels = record.raw_channels or []
        if not raw_channels:
            raise ValueError(f"Test '{test_id}' has no channel data.")

        # Use raw values for feature extraction
        raw_values = [ch.get("rawValue", 0.0) for ch in raw_channels]
        features = _extractor.extract(raw_values)

        return {
            "testId":   test_id,
            "foodType": record.food_type,
            "source":   record.source,
            "features": features.to_dict(),
            "referenceNote": (
                "Reference spectral database not yet available. "
                "Features are for informational purposes only."
            ),
        }

    def compare_tests(self, test_id_a: str, test_id_b: str) -> dict:
        """
        Compare spectral features between two test records.

        Returns feature differences and similarity indicators.
        Used for analysis and quality checks.
        """
        feat_a = self.get_spectral_features(test_id_a)["features"]
        feat_b = self.get_spectral_features(test_id_b)["features"]

        differences = {}
        for key in feat_a:
            va = feat_a[key]
            vb = feat_b[key]
            if isinstance(va, (int, float)) and isinstance(vb, (int, float)):
                differences[key] = {
                    "testA":    va,
                    "testB":    vb,
                    "delta":    round(vb - va, 4),
                    "pctChange": round((vb - va) / (abs(va) + 1e-8) * 100, 2),
                }

        return {
            "testIdA":     test_id_a,
            "testIdB":     test_id_b,
            "differences": differences,
            "note": "Comparison is based on extracted features, not raw ML classification.",
        }
