"""Device routes — BLE connection status and device management."""
from fastapi import APIRouter
from app.hardware.device_manager import get_sensor_source, connect_source, disconnect_source
from app.core.config import settings

router = APIRouter()


@router.get("/status")
async def device_status():
    source = get_sensor_source()
    return {
        "connected": source.is_connected(),
        "sourceType": source.get_source_type(),
        "deviceInfo": source.get_device_info(),
        "isDevelopmentMode": settings.data_source == "DEVELOPMENT",
    }


@router.post("/connect")
async def connect_device():
    success = await connect_source()
    source = get_sensor_source()
    return {
        "success": success,
        "connected": source.is_connected(),
        "deviceInfo": source.get_device_info(),
    }


@router.post("/disconnect")
async def disconnect_device():
    await disconnect_source()
    return {"success": True, "connected": False}
