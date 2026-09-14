"""
Admin routes — system-wide operator management, device registry,
cross-operator test overview, and system health.

Authentication is NOT required per the design spec.
Authentication can be added as a middleware layer later.
"""
from __future__ import annotations
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import Device, MLModel, Operator, TestRecord, Dataset, PredictionRecord
from app.core.config import settings
from app.ml.model_registry import ModelRegistry

router = APIRouter()
logger = logging.getLogger("nanotech.api.admin")
_registry = ModelRegistry()


# ── Request/Response Schemas ──────────────────────────────────────────

class CreateOperatorRequest(BaseModel):
    id: str
    name: str


# ── System Overview ───────────────────────────────────────────────────

@router.get("/overview")
def system_overview(db: Session = Depends(get_db)):
    """High-level KPIs for the admin dashboard."""
    total_tests    = db.query(TestRecord).count()
    total_ops      = db.query(Operator).count()
    total_devices  = db.query(Device).count()
    total_datasets = db.query(Dataset).count()
    total_models   = len(_registry.list_models())
    dev_tests      = db.query(TestRecord).filter(TestRecord.source == "DEVELOPMENT").count()
    ble_tests      = db.query(TestRecord).filter(TestRecord.source == "BLE").count()

    # Result distribution
    by_label = dict(
        db.query(TestRecord.final_label, func.count())
        .group_by(TestRecord.final_label)
        .all()
    )
    by_food = dict(
        db.query(TestRecord.food_type, func.count())
        .group_by(TestRecord.food_type)
        .all()
    )

    # Most recent test
    latest = db.query(TestRecord).order_by(desc(TestRecord.timestamp)).first()

    return {
        "totalTests":    total_tests,
        "totalOperators": total_ops,
        "totalDevices":  total_devices,
        "totalDatasets": total_datasets,
        "totalModels":   total_models,
        "devTests":      dev_tests,
        "bleTests":      ble_tests,
        "byLabel":       by_label,
        "byFoodType":    by_food,
        "dataSource":    settings.data_source,
        "appVersion":    settings.app_version,
        "latestTestAt":  latest.timestamp.isoformat() if latest else None,
    }


# ── Operator Management ───────────────────────────────────────────────

@router.get("/operators")
def list_operators(db: Session = Depends(get_db)):
    """List all operators with their test counts."""
    operators = db.query(Operator).order_by(Operator.created_at.desc()).all()
    result = []
    for op in operators:
        test_count = db.query(TestRecord).filter(TestRecord.operator_id == op.id).count()
        last_test = (
            db.query(TestRecord)
            .filter(TestRecord.operator_id == op.id)
            .order_by(desc(TestRecord.timestamp))
            .first()
        )
        result.append({
            "id":          op.id,
            "name":        op.name,
            "createdAt":   op.created_at.isoformat(),
            "testCount":   test_count,
            "lastTestAt":  last_test.timestamp.isoformat() if last_test else None,
        })
    return result


@router.post("/operators", status_code=201)
def create_operator(req: CreateOperatorRequest, db: Session = Depends(get_db)):
    """Create a new operator."""
    if db.get(Operator, req.id):
        raise HTTPException(status_code=409, detail=f"Operator '{req.id}' already exists.")
    op = Operator(id=req.id, name=req.name)
    db.add(op)
    db.commit()
    logger.info("Admin: created operator '%s' (%s)", req.name, req.id)
    return {"id": op.id, "name": op.name, "createdAt": op.created_at.isoformat()}


@router.delete("/operators/{operator_id}", status_code=204)
def delete_operator(operator_id: str, db: Session = Depends(get_db)):
    """Delete an operator. Fails if operator has existing tests."""
    op = db.get(Operator, operator_id)
    if not op:
        raise HTTPException(status_code=404, detail=f"Operator '{operator_id}' not found.")
    test_count = db.query(TestRecord).filter(TestRecord.operator_id == operator_id).count()
    if test_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete operator '{operator_id}' — they have {test_count} test records. "
                   "Delete their tests first or reassign them.",
        )
    db.delete(op)
    db.commit()
    logger.info("Admin: deleted operator '%s'", operator_id)


# ── Device Registry ───────────────────────────────────────────────────

@router.get("/devices")
def list_devices(db: Session = Depends(get_db)):
    """All registered devices with usage statistics."""
    devices = db.query(Device).order_by(Device.registered_at.desc()).all()
    result = []
    for dev in devices:
        test_count = db.query(TestRecord).filter(TestRecord.device_id == dev.id).count()
        last_test = (
            db.query(TestRecord)
            .filter(TestRecord.device_id == dev.id)
            .order_by(desc(TestRecord.timestamp))
            .first()
        )
        result.append({
            "id":             dev.id,
            "name":           dev.name,
            "sensorType":     dev.sensor_type,
            "channelCount":   dev.channel_count,
            "firmwareVersion": dev.firmware_version,
            "registeredAt":   dev.registered_at.isoformat(),
            "testCount":      test_count,
            "lastTestAt":     last_test.timestamp.isoformat() if last_test else None,
        })
    return result


# ── Cross-Operator Test History ────────────────────────────────────────

@router.get("/tests")
def all_tests(
    operator_id: Optional[str] = Query(None),
    food_type:   Optional[str] = Query(None),
    final_label: Optional[str] = Query(None),
    source:      Optional[str] = Query(None),
    limit:  int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    """All tests across all operators, fully filterable."""
    q = db.query(TestRecord).order_by(desc(TestRecord.timestamp))
    if operator_id:
        q = q.filter(TestRecord.operator_id == operator_id)
    if food_type:
        q = q.filter(TestRecord.food_type == food_type)
    if final_label:
        q = q.filter(TestRecord.final_label == final_label)
    if source:
        q = q.filter(TestRecord.source == source)

    total = q.count()
    records = q.offset(offset).limit(limit).all()

    return {
        "total":  total,
        "offset": offset,
        "limit":  limit,
        "items": [
            {
                "testId":          r.id,
                "operatorId":      r.operator_id,
                "operatorName":    r.operator.name if r.operator else r.operator_id,
                "deviceId":        r.device_id,
                "foodType":        r.food_type,
                "source":          r.source,
                "finalLabel":      r.final_label,
                "validationStatus": r.validation_status,
                "timestamp":       r.timestamp.isoformat(),
                "probability":     r.prediction.probability if r.prediction else None,
                "modelVersion":    r.prediction.model.version if r.prediction and r.prediction.model else None,
            }
            for r in records
        ],
    }


# ── Model Registry Admin ───────────────────────────────────────────────

@router.get("/models")
def admin_list_models(db: Session = Depends(get_db)):
    """All models with usage (prediction count)."""
    models_meta = _registry.list_models()
    db_models   = {m.id: m for m in db.query(MLModel).all()}
    result = []
    for meta in models_meta:
        mid = meta.get("model_id")
        pred_count = (
            db.query(PredictionRecord).filter(PredictionRecord.model_id == mid).count()
            if mid else 0
        )
        db_m = db_models.get(mid)
        result.append({
            **meta,
            "predictionCount": pred_count,
            "isActive":        db_m.is_active if db_m else False,
        })
    return result


# ── System Information ─────────────────────────────────────────────────

@router.get("/system")
def system_info():
    """Runtime configuration and storage paths."""
    return {
        "appName":           settings.app_name,
        "appVersion":        settings.app_version,
        "dataSource":        settings.data_source,
        "databaseUrl":       settings.database_url,
        "modelStoragePath":  settings.model_storage_path,
        "datasetStoragePath": settings.dataset_storage_path,
        "sensorChannels":    settings.sensor_channel_count,
        "sensorWavelengths": settings.sensor_channel_wavelengths,
        "logLevel":          settings.log_level,
        "isDevelopmentMode": settings.data_source == "DEVELOPMENT",
        "bleConfig": {
            "deviceNamePrefix": settings.ble_device_name_prefix,
            "scanTimeout":      settings.ble_scan_timeout_seconds,
            "connectionTimeout": settings.ble_connection_timeout_seconds,
        } if settings.data_source == "BLE" else None,
    }
