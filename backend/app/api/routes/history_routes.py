"""History routes — searchable/filterable test history."""
from __future__ import annotations
import json
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.database import get_db
from app.database.models import TestRecord

router = APIRouter()


@router.get("/")
def get_history(
    food_type: Optional[str] = Query(None),
    operator_id: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    q = db.query(TestRecord).order_by(desc(TestRecord.timestamp))
    if food_type:
        q = q.filter(TestRecord.food_type == food_type)
    if operator_id:
        q = q.filter(TestRecord.operator_id == operator_id)
    if source:
        q = q.filter(TestRecord.source == source)

    total = q.count()
    records = q.offset(offset).limit(limit).all()

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": [
            {
                "testId": r.id,
                "foodType": r.food_type,
                "source": r.source,
                "operatorId": r.operator_id,
                "deviceId": r.device_id,
                "finalLabel": r.final_label,
                "validationStatus": r.validation_status,
                "timestamp": r.timestamp.isoformat(),
                "modelVersion": r.prediction.model.version if r.prediction and r.prediction.model else None,
                "probability": r.prediction.probability if r.prediction else None,
            }
            for r in records
        ],
    }


@router.get("/summary")
def history_summary(db: Session = Depends(get_db)):
    """Summary counts for the dashboard."""
    total = db.query(TestRecord).count()
    from sqlalchemy import func
    by_label = db.query(TestRecord.final_label, func.count()).group_by(TestRecord.final_label).all()
    by_food = db.query(TestRecord.food_type, func.count()).group_by(TestRecord.food_type).all()
    return {
        "totalTests": total,
        "byLabel": {label: count for label, count in by_label},
        "byFoodType": {ft: count for ft, count in by_food},
    }
