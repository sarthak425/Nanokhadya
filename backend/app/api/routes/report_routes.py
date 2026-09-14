"""
Report routes — generate and download test reports.
"""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/{test_id}", response_class=PlainTextResponse)
def get_report(test_id: str, db: Session = Depends(get_db)):
    """
    Generate a full structured text report for a test.
    Returns plain text suitable for download.
    """
    svc = ReportService(db)
    try:
        report = svc.generate_text_report(test_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    headers = {
        "Content-Disposition": f'attachment; filename="nanotech-report-{test_id}.txt"',
    }
    return PlainTextResponse(content=report, headers=headers)
