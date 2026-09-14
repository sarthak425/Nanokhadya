"""
Result/Decision Engine — converts raw ML prediction into application-level result.

This layer is deliberately separate from the SVM classifier so that business logic
(what constitutes SAFE vs SUSPECTED vs ADULTERATED) can be adjusted without
touching the ML code.

IMPORTANT: No fake results are ever generated here.
If a model is unavailable or confidence is too low, the result is UNKNOWN.
"""
from __future__ import annotations
import logging
from typing import Optional

import numpy as np
from sklearn.pipeline import Pipeline

from app.domain.enums import PredictionLabel, ResultConfidence
from app.domain.models import PredictionResult, ModelMetadata
from app.ml.model_pipeline import get_pca_scatter_data

logger = logging.getLogger("nanotech.decision.result_engine")

# Confidence thresholds for result tiers
HIGH_CONFIDENCE = 0.85
MEDIUM_CONFIDENCE = 0.65

# Map model class labels to PredictionLabel enum
_LABEL_MAP: dict[str, PredictionLabel] = {
    "AUTHENTIC": PredictionLabel.SAFE,
    "SAFE": PredictionLabel.SAFE,
    "ADULTERATED": PredictionLabel.ADULTERATED,
    "SUSPECTED": PredictionLabel.SUSPECTED,
    "UNKNOWN": PredictionLabel.UNKNOWN,
}

# Possible issue descriptions per class
_ISSUE_MAP: dict[str, str] = {
    "ADULTERATED": "Possible adulteration detected — spectral pattern differs significantly from authentic reference",
    "SUSPECTED": "Spectral pattern shows intermediate characteristics — possible partial adulteration",
    "AUTHENTIC": None,
    "SAFE": None,
}


class ResultEngine:
    """
    Applies a trained ML pipeline to preprocessed spectral data and
    produces a structured PredictionResult.
    """

    def predict(
        self,
        feature_vector: list[float],
        pipeline: Pipeline,
        model_metadata: ModelMetadata,
        X_train: Optional[np.ndarray] = None,
        y_train: Optional[list[str]] = None,
    ) -> tuple[PredictionResult, Optional[dict]]:
        """
        Run the pipeline on a feature vector and return prediction + PCA scatter.

        Returns:
            (PredictionResult, pca_scatter_dict | None)
        """
        X = np.array(feature_vector).reshape(1, -1)
        warnings: list[str] = []

        try:
            raw_label = pipeline.predict(X)[0]
        except Exception as exc:
            logger.error("Prediction failed: %s", exc)
            return (
                PredictionResult(
                    raw_label="ERROR",
                    predicted_label=PredictionLabel.UNKNOWN,
                    probability=None,
                    confidence_tier=ResultConfidence.UNAVAILABLE,
                    model_metadata=model_metadata,
                    warnings=[f"Prediction error: {exc}"],
                ),
                None,
            )

        # Probability (via Platt scaling if SVM was trained with probability=True)
        probability: Optional[float] = None
        class_probs: Optional[dict] = None
        confidence_tier = ResultConfidence.UNAVAILABLE

        try:
            if hasattr(pipeline, "predict_proba"):
                proba_arr = pipeline.predict_proba(X)[0]
                classes = pipeline.classes_
                class_probs = {cls: float(p) for cls, p in zip(classes, proba_arr)}
                probability = float(max(proba_arr))

                if probability >= HIGH_CONFIDENCE:
                    confidence_tier = ResultConfidence.HIGH
                elif probability >= MEDIUM_CONFIDENCE:
                    confidence_tier = ResultConfidence.MEDIUM
                else:
                    confidence_tier = ResultConfidence.LOW
                    warnings.append(
                        f"Low model confidence ({probability:.1%}) — result should be interpreted with caution"
                    )
        except Exception as exc:
            logger.warning("Probability extraction failed: %s", exc)
            warnings.append("Model probability unavailable")

        # Map to PredictionLabel
        predicted_label = _LABEL_MAP.get(raw_label, PredictionLabel.UNKNOWN)

        prediction = PredictionResult(
            raw_label=raw_label,
            predicted_label=predicted_label,
            probability=probability,
            confidence_tier=confidence_tier,
            class_probabilities=class_probs,
            model_metadata=model_metadata,
            warnings=warnings,
        )

        # PCA scatter for visualization
        pca_scatter = None
        if X_train is not None and y_train is not None:
            try:
                pca_scatter = get_pca_scatter_data(pipeline, X_train, y_train, X_new=X)
            except Exception as exc:
                logger.warning("PCA scatter generation failed: %s", exc)

        logger.info(
            "Result: %s (confidence=%s, probability=%s)",
            predicted_label, confidence_tier,
            f"{probability:.1%}" if probability else "N/A",
        )

        return prediction, pca_scatter

    @staticmethod
    def get_possible_issue(label: PredictionLabel) -> Optional[str]:
        return _ISSUE_MAP.get(label.value if hasattr(label, 'value') else str(label))
