"""Test routes — run a food safety test and retrieve test details."""
from __future__ import annotations
from dataclasses import asdict
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.test_service import TestService

router = APIRouter()


class RunTestRequest(BaseModel):
    foodType: str = "Milk"
    operatorId: str = "default-operator"


def _serialize_test_result(result) -> dict:
    """Convert TestResult domain object to JSON-serializable dict."""
    pca = result.pca_result
    pred = result.prediction
    meta = result.model_metadata

    return {
        "testId": result.test_id,
        "deviceId": result.device_id,
        "operatorId": result.operator_id,
        "foodType": result.food_type,
        "source": result.source,
        "timestamp": result.timestamp.isoformat(),
        "isDevelopmentResult": result.is_development_result,
        "validation": {
            "status": result.validation_status.value,
            "warnings": result.validation_warnings,
        },
        "preprocessing": {
            "steps": result.preprocessing_steps,
        },
        "channels": result.raw_channels,
        "pca": {
            "components": pca.components if pca else [],
            "explainedVarianceRatio": pca.explained_variance_ratio if pca else [],
            "trainingScatter": pca.training_scatter if pca else [],
        } if pca else None,
        "prediction": {
            "rawLabel": pred.raw_label,
            "predictedLabel": pred.predicted_label.value,
            "probability": pred.probability,
            "confidenceTier": pred.confidence_tier.value,
            "classProbabilities": pred.class_probabilities,
            "warnings": pred.warnings,
        } if pred else None,
        "finalLabel": result.final_label.value if result.final_label else "UNKNOWN",
        "possibleIssue": result.possible_issue,
        "model": {
            "id": meta.model_id,
            "type": meta.model_type,
            "version": meta.model_version,
            "isDevelopmentModel": meta.is_development_model,
            "foodType": meta.food_type,
            "datasetLabel": meta.dataset_label,
        } if meta else None,
    }


@router.post("/run")
async def run_test(request: RunTestRequest, db: Session = Depends(get_db)):
    try:
        service = TestService(db)
        result = await service.run_test(
            food_type=request.foodType,
            operator_id=request.operatorId,
        )
        return _serialize_test_result(result)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")


@router.get("/{test_id}")
def get_test(test_id: str, db: Session = Depends(get_db)):
    from app.database.models import TestRecord
    import json
    record = db.get(TestRecord, test_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Test {test_id} not found")

    pred = record.prediction
    return {
        "testId": record.id,
        "deviceId": record.device_id,
        "operatorId": record.operator_id,
        "foodType": record.food_type,
        "source": record.source,
        "timestamp": record.timestamp.isoformat(),
        "validation": {
            "status": record.validation_status,
            "warnings": json.loads(record.validation_warnings or "[]"),
        },
        "preprocessing": {
            "steps": json.loads(record.preprocessing_steps or "[]"),
        },
        "channels": record.raw_channels or [],
        "pca": {
            "components": json.loads(record.pca_components or "[]"),
        },
        "finalLabel": record.final_label,
        "possibleIssue": record.possible_issue,
        "prediction": {
            "predictedLabel": pred.predicted_label if pred else None,
            "probability": pred.probability if pred else None,
            "confidenceTier": pred.confidence_tier if pred else None,
            "classProbabilities": pred.class_probabilities if pred else None,
            "modelId": pred.model_id if pred else None,
        } if pred else None,
    }
