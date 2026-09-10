from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from image_processor import CartridgeImageProcessor
from calibration import solve_4pl_concentration
import uvicorn

app = FastAPI(
    title="NanoKhadya Computer Vision & Calibration Engine",
    description="Microfluidic Colorimetric Image Analysis & 4PL Regression Service - SIH PS 26235",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = CartridgeImageProcessor()

class FourPLRequest(BaseModel):
    deltaE: float
    params: Dict[str, float]

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "NanoKhadya-CV-Engine",
        "version": "1.0.0",
        "supported_analytes": ["MELAMINE", "H2O2", "UREA", "STARCH", "NEUTRALIZER"]
    }

@app.post("/analyze/image")
async def analyze_cartridge_image(file: UploadFile = File(...)):
    """
    Accepts raw JPEG from ESP32-S3 or user upload.
    Performs perspective unwarping, white standard normalization,
    and extracts CIELAB colorimetric Delta-E across all 6 zones.
    """
    try:
        contents = await file.read()
        result = processor.process_cartridge_image(contents)
        if not result["success"]:
            raise HTTPException(status_code=422, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failure: {str(e)}")

@app.post("/calibrate/4pl")
def calculate_concentration(req: FourPLRequest):
    """
    Solves 4-Parameter Logistic equation for given Delta-E.
    """
    conc = solve_4pl_concentration(req.deltaE, req.params)
    return {
        "deltaE": req.deltaE,
        "estimatedConcentration": conc,
        "formula": "y = D + (A - D) / [1 + (x / C)^B]"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
