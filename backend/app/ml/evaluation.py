"""Model evaluation — computes honest metrics from actual data only."""
from __future__ import annotations
import logging
from typing import Optional

import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report,
)
from sklearn.pipeline import Pipeline

logger = logging.getLogger("nanotech.ml.evaluation")


def compute_evaluation_metrics(
    pipeline: Pipeline,
    X: np.ndarray,
    y: list[str],
    cv_scores: Optional[np.ndarray] = None,
) -> dict:
    """
    Compute classification metrics from training data and cross-validation scores.
    Only reports metrics calculated from actual data — no invented numbers.
    """
    y_pred = pipeline.predict(X)
    classes = sorted(set(y))

    metrics = {
        "training_accuracy": float(accuracy_score(y, y_pred)),
        "precision_weighted": float(precision_score(y, y_pred, average="weighted", zero_division=0)),
        "recall_weighted": float(recall_score(y, y_pred, average="weighted", zero_division=0)),
        "f1_weighted": float(f1_score(y, y_pred, average="weighted", zero_division=0)),
        "classes": classes,
        "sample_count": len(y),
        "confusion_matrix": confusion_matrix(y, y_pred, labels=classes).tolist(),
        "classification_report": classification_report(y, y_pred, zero_division=0),
    }

    if cv_scores is not None:
        metrics["cv_mean_accuracy"] = float(cv_scores.mean())
        metrics["cv_std_accuracy"] = float(cv_scores.std())
        metrics["cv_fold_scores"] = [float(s) for s in cv_scores]

    logger.debug(
        "Evaluation: training_acc=%.3f, cv_acc=%.3f±%.3f",
        metrics["training_accuracy"],
        metrics.get("cv_mean_accuracy", 0.0),
        metrics.get("cv_std_accuracy", 0.0),
    )

    return metrics
