"""
ModelRegistry — persists, loads, and versions ML models.
Models are stored as joblib files under data/models/.
"""
from __future__ import annotations
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import joblib
from sklearn.pipeline import Pipeline

from app.core.config import settings

logger = logging.getLogger("nanotech.ml.registry")

_ACTIVE_MODELS: dict[str, dict] = {}  # model_id → {pipeline, metadata}


class ModelRegistry:
    """Saves, loads, and activates versioned ML models."""

    def __init__(self, storage_path: str = settings.model_storage_path):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def save(
        self,
        model_id: str,
        pipeline: Pipeline,
        version: str,
        food_type: str,
        classes: list[str],
        dataset_id: Optional[str],
        dataset_label: Optional[str],
        is_development_model: bool,
        metrics: dict,
        sample_count: int,
        pca_components: int,
        svm_kernel: str,
        trained_at: datetime,
    ) -> str:
        """Persist pipeline and metadata to disk. Returns model file path."""
        model_dir = self.storage_path / model_id
        model_dir.mkdir(exist_ok=True)

        pipeline_path = model_dir / "pipeline.joblib"
        meta_path = model_dir / "metadata.json"

        joblib.dump(pipeline, pipeline_path)

        meta = {
            "model_id": model_id,
            "version": version,
            "food_type": food_type,
            "classes": classes,
            "dataset_id": dataset_id,
            "dataset_label": dataset_label,
            "is_development_model": is_development_model,
            "sample_count": sample_count,
            "pca_components": pca_components,
            "svm_kernel": svm_kernel,
            "metrics": {k: v for k, v in metrics.items() if k != "classification_report"},
            "trained_at": trained_at.isoformat(),
            "file_path": str(pipeline_path),
        }
        meta_path.write_text(json.dumps(meta, indent=2))

        # Cache in memory
        _ACTIVE_MODELS[model_id] = {"pipeline": pipeline, "metadata": meta}
        logger.info("ModelRegistry: saved model %s → %s", model_id, model_dir)
        return str(pipeline_path)

    def load(self, model_id: str) -> tuple[Pipeline, dict]:
        """Load pipeline and metadata. Checks memory cache first."""
        if model_id in _ACTIVE_MODELS:
            m = _ACTIVE_MODELS[model_id]
            return m["pipeline"], m["metadata"]

        model_dir = self.storage_path / model_id
        pipeline_path = model_dir / "pipeline.joblib"
        meta_path = model_dir / "metadata.json"

        if not pipeline_path.exists():
            raise FileNotFoundError(f"Model {model_id} not found at {pipeline_path}")

        pipeline = joblib.load(pipeline_path)
        meta = json.loads(meta_path.read_text())
        _ACTIVE_MODELS[model_id] = {"pipeline": pipeline, "metadata": meta}
        logger.info("ModelRegistry: loaded model %s", model_id)
        return pipeline, meta

    def list_models(self) -> list[dict]:
        """Return metadata for all saved models."""
        result = []
        for model_dir in sorted(self.storage_path.iterdir()):
            meta_path = model_dir / "metadata.json"
            if meta_path.exists():
                result.append(json.loads(meta_path.read_text()))
        return result

    def get_latest_model(self, food_type: Optional[str] = None) -> Optional[tuple[Pipeline, dict]]:
        """Return the most recently trained model, optionally filtered by food type."""
        models = self.list_models()
        if food_type:
            models = [m for m in models if m.get("food_type") == food_type]
        if not models:
            return None
        # Sort by trained_at descending
        models.sort(key=lambda m: m.get("trained_at", ""), reverse=True)
        return self.load(models[0]["model_id"])
