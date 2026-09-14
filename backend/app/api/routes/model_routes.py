"""Model management routes — list models, train from dataset, get evaluation."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.model_service import ModelService
from app.ml.model_registry import ModelRegistry

router = APIRouter()
_registry = ModelRegistry()


class TrainModelRequest(BaseModel):
    datasetId: str
    pcaComponents: int = 2
    svmKernel: str = "rbf"
    svmC: float = 1.0


@router.get("/")
def list_models():
    return _registry.list_models()


@router.post("/train")
def train_model(request: TrainModelRequest, db: Session = Depends(get_db)):
    try:
        svc = ModelService(db)
        result = svc.train_from_dataset(
            dataset_id=request.datasetId,
            pca_components=request.pcaComponents,
            svm_kernel=request.svmKernel,
            svm_c=request.svmC,
        )
        return {
            "modelId": result.model_id,
            "version": result.version,
            "foodType": result.food_type,
            "classes": result.classes,
            "sampleCount": result.sample_count,
            "isDevelopmentModel": result.is_development_model,
            "metrics": result.metrics,
            "warnings": result.warnings,
            "trainedAt": result.trained_at.isoformat(),
        }
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{model_id}")
def get_model(model_id: str):
    try:
        _, meta = _registry.load(model_id)
        return meta
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
