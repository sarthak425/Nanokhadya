# NanoTech Food Safety System — Architecture

## System Overview

```
PHYSICAL SYSTEM (Future)          SOFTWARE SYSTEM (Current)
────────────────────────          ─────────────────────────
Food Sample                       ┌─────────────────────────────────┐
     ↓                            │         FastAPI Backend         │
Nano-Sensing Strip                │                                 │
     ↓                            │  SensorDataSource (abstract)    │
AS7265x (18-ch, 410-940nm)        │   ├─ BleSensorDataSource (BLE)  │
     ↓                            │   └─ DevelopmentDataSource      │
ESP32                             │           ↓                     │
     ↓ BLE                        │  DataValidator                  │
BleSensorDataSource ─────────────►│           ↓                     │
                                  │  SpectralPreprocessor           │
DevelopmentDataSource ───────────►│    (smoothing → baseline → SNV) │
(Development Mode)                │           ↓                     │
                                  │  PCA (sklearn)                  │
                                  │           ↓                     │
                                  │  SVM (sklearn, probability=True)│
                                  │           ↓                     │
                                  │  ResultEngine                   │
                                  │           ↓                     │
                                  │  SQLite (SQLAlchemy)            │
                                  └─────────────────────────────────┘
                                              ↕ REST API
                                  ┌─────────────────────────────────┐
                                  │     React + TypeScript (Vite)   │
                                  │  Dashboard · Test · History     │
                                  │  Datasets · Models · Device     │
                                  └─────────────────────────────────┘
```

## Key Architectural Decision: SensorDataSource Abstraction

The most critical design decision is the `SensorDataSource` abstract class.

- `DevelopmentDataSource` — generates realistic 18-channel spectral data
- `BleSensorDataSource` — connects to real ESP32 via Bluetooth LE (bleak)

Switch with one environment variable:
```
DATA_SOURCE=DEVELOPMENT   # No hardware needed
DATA_SOURCE=BLE           # Real AS7265x + ESP32
```

All downstream code (validation → preprocessing → ML → storage → UI) is identical.

## ML Pipeline

```
Raw 18-channel reading
        ↓
DataValidator (18 channels, range, NaN, spikes)
        ↓
SpectralPreprocessor
  1. Smoothing (moving average w=3)
  2. Baseline correction (ALS)
  3. Normalization (SNV)
        ↓
sklearn Pipeline:
  StandardScaler → PCA(n=2) → SVC(rbf, probability=True)
        ↓
ResultEngine
  SAFE | SUSPECTED | ADULTERATED | UNKNOWN
        ↓
SQLite storage (fully traceable per model version)
```

## Database Schema

```
operators ──┐
            ├──► test_records ──► prediction_records ──► ml_models
devices ────┘
datasets (separate from test records)
```

## File Structure

```
backend/
  app/
    core/           config.py, logging_config.py
    domain/         enums/, models/
    database/       database.py, models.py
    hardware/       sensor_data_source.py (abstract)
                    development_data_source.py
                    ble_sensor_data_source.py
                    ble_protocol.py
                    device_manager.py
    acquisition/    data_validator.py
    processing/     preprocessing.py
    ml/             model_pipeline.py, model_trainer.py,
                    model_registry.py, evaluation.py
    decision/       result_engine.py
    services/       test_service.py, dataset_service.py, model_service.py
    api/routes/     device, test, history, dataset, model routes
    main.py
  data/
    models/         (versioned .joblib pipeline files)
    datasets/       (imported CSV files)
frontend/
  src/
    services/       api.ts (typed API layer)
    components/     Sidebar, SpectralChart, PCAChart, ChannelTable, ResultCard
    pages/          Dashboard, Device, NewTest, History, TestDetail,
                    Dataset, Model, Settings
docs/
  architecture.md, ble_protocol.md, ml_pipeline.md
```
