"""Dataset management routes."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
import shutil, tempfile, os

from app.database.database import get_db
from app.services.dataset_service import DatasetService

router = APIRouter()


class ImportDatasetRequest(BaseModel):
    name: str
    description: str = ""
    isDevelopmentData: bool = True


@router.get("/")
def list_datasets(db: Session = Depends(get_db)):
    svc = DatasetService(db)
    return svc.list_datasets()


@router.post("/import")
async def import_dataset(
    file: UploadFile = File(...),
    name: str = "Unnamed Dataset",
    description: str = "",
    isDevelopmentData: bool = True,
    db: Session = Depends(get_db),
):
    # Save uploaded file to temp location
    suffix = ".csv"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        svc = DatasetService(db)
        dataset = svc.import_csv(
            file_path=tmp_path,
            name=name,
            description=description,
            is_development_data=isDevelopmentData,
        )
        return {
            "id": dataset.id,
            "name": dataset.name,
            "foodType": dataset.food_type,
            "sampleCount": dataset.sample_count,
            "classDistribution": dataset.class_distribution,
            "isDevelopmentData": dataset.is_development_data,
        }
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    finally:
        os.unlink(tmp_path)
