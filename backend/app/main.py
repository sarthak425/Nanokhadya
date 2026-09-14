"""
NanoTech Food Safety System — FastAPI Application
--------------------------------------------------
All API routes, CORS configuration, database initialization,
and application lifecycle management.
"""
from __future__ import annotations
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import configure_logging
from app.database.database import create_all_tables
from app.hardware.device_manager import connect_source

# API route modules
from app.api.routes import device_routes, test_routes, history_routes, dataset_routes, model_routes, admin_routes, report_routes

configure_logging()
logger = logging.getLogger("nanotech.main")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="NanoTech Food Safety System API — AS7265x spectral analysis platform",
)

# CORS: allow React dev server on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(device_routes.router,  prefix="/api/device",   tags=["Device"])
app.include_router(test_routes.router,    prefix="/api/tests",    tags=["Tests"])
app.include_router(history_routes.router, prefix="/api/history",  tags=["History"])
app.include_router(dataset_routes.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(model_routes.router,   prefix="/api/models",   tags=["Models"])
app.include_router(admin_routes.router,   prefix="/api/admin",    tags=["Admin"])
app.include_router(report_routes.router,  prefix="/api/reports",  tags=["Reports"])


@app.on_event("startup")
async def startup_event():
    logger.info("Starting NanoTech Food Safety System v%s", settings.app_version)
    create_all_tables()
    logger.info("Database tables created/verified")
    # Connect sensor source (development or BLE)
    connected = await connect_source()
    logger.info("Sensor source connected: %s", connected)


@app.get("/api/system/status")
async def system_status():
    from app.hardware.device_manager import get_sensor_source
    source = get_sensor_source()
    return {
        "status": "ok",
        "appName": settings.app_name,
        "appVersion": settings.app_version,
        "dataSource": settings.data_source,
        "sensorConnected": source.is_connected(),
        "deviceInfo": source.get_device_info(),
        "sensor": {
            "type": "AS7265x",
            "channels": settings.sensor_channel_count,
            "wavelengthRange": f"{settings.sensor_channel_wavelengths[0]}–{settings.sensor_channel_wavelengths[-1]} nm",
            "wavelengths": settings.sensor_channel_wavelengths,
        },
        "isDevelopmentMode": settings.data_source == "DEVELOPMENT",
    }
