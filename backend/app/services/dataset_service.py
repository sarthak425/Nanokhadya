"""
DatasetService — imports, validates, and manages labelled spectral datasets.

CSV format expected:
  sampleId, foodType, label, ch1, ch2, ..., ch18

The dataset is stored in the database and the raw CSV file is preserved.
Development datasets are flagged so they are never confused with real data.
"""
from __future__ import annotations
import logging
import uuid
from collections import Counter
from pathlib import Path
from typing import Optional

import pandas as pd
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import Dataset

logger = logging.getLogger("nanotech.services.dataset")

REQUIRED_COLUMNS_PREFIX = ["sampleId", "foodType", "label"]
CHANNEL_COLUMNS = [f"ch{i+1}" for i in range(18)]
ALL_REQUIRED = REQUIRED_COLUMNS_PREFIX + CHANNEL_COLUMNS


class DatasetService:
    def __init__(self, db: Session):
        self.db = db

    def import_csv(
        self,
        file_path: str,
        name: str,
        description: Optional[str] = None,
        is_development_data: bool = False,
    ) -> Dataset:
        """
        Import a labelled spectral dataset from CSV.
        Validates structure before saving.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Dataset file not found: {file_path}")

        df = pd.read_csv(path)

        # Validate required columns
        missing = [c for c in ALL_REQUIRED if c not in df.columns]
        if missing:
            raise ValueError(f"CSV missing required columns: {missing}")

        # Check channel values are numeric
        for col in CHANNEL_COLUMNS:
            if not pd.api.types.is_numeric_dtype(df[col]):
                raise ValueError(f"Column '{col}' contains non-numeric values.")

        food_types = df["foodType"].unique().tolist()
        labels = df["label"].unique().tolist()
        class_distribution = dict(Counter(df["label"]))

        dataset_id = f"ds-{uuid.uuid4().hex[:8]}"
        food_type = food_types[0] if len(food_types) == 1 else "Mixed"

        dataset = Dataset(
            id=dataset_id,
            name=name,
            food_type=food_type,
            description=description,
            file_path=str(path.resolve()),
            is_development_data=is_development_data,
            sample_count=len(df),
            class_distribution=class_distribution,
        )
        self.db.add(dataset)
        self.db.commit()
        logger.info(
            "DatasetService: imported '%s' — %d samples, classes=%s",
            name, len(df), labels,
        )
        return dataset

    def load_xy(self, dataset_id: str) -> tuple[list[list[float]], list[str]]:
        """Load feature matrix X and label vector y from a saved dataset."""
        dataset = self.db.get(Dataset, dataset_id)
        if dataset is None:
            raise ValueError(f"Dataset {dataset_id} not found in database.")
        if not dataset.file_path or not Path(dataset.file_path).exists():
            raise FileNotFoundError(f"Dataset file missing: {dataset.file_path}")

        df = pd.read_csv(dataset.file_path)
        X = df[CHANNEL_COLUMNS].values.tolist()
        y = df["label"].tolist()
        return X, y

    def list_datasets(self) -> list[dict]:
        datasets = self.db.query(Dataset).order_by(Dataset.imported_at.desc()).all()
        return [
            {
                "id": d.id,
                "name": d.name,
                "foodType": d.food_type,
                "sampleCount": d.sample_count,
                "classDistribution": d.class_distribution,
                "isDevelopmentData": d.is_development_data,
                "importedAt": d.imported_at.isoformat(),
            }
            for d in datasets
        ]
