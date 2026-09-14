# Database Schema — NanoTech Food Safety System

## Overview

SQLite database via SQLAlchemy ORM.
Every test is fully traceable: operator → device → reading → prediction → model.

---

## Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  operators   │         │  test_records     │         │  prediction_     │
│──────────────│         │──────────────────│         │  records         │
│ id (PK)      │──1:N───►│ id (PK)          │──1:1───►│──────────────────│
│ name         │         │ operator_id (FK) │         │ id (PK, auto)    │
│ created_at   │         │ device_id (FK)   │         │ test_id (FK,UQ)  │
└──────────────┘         │ food_type        │         │ model_id (FK)    │
                         │ source           │         │ raw_label        │
┌──────────────┐         │ timestamp        │         │ predicted_label  │
│  devices     │         │ validation_status│         │ probability      │
│──────────────│         │ validation_      │         │ confidence_tier  │
│ id (PK)      │──1:N───►│   warnings (JSON)│         │ class_           │
│ name         │         │ preprocessing_   │         │   probabilities  │
│ sensor_type  │         │   steps (JSON)   │         │   (JSON)         │
│ channel_count│         │ raw_channels     │         └────────┬─────────┘
│ firmware_    │         │   (JSON)         │                  │
│   version    │         │ pca_components   │         ┌────────▼─────────┐
│ registered_at│         │ final_label      │         │  ml_models       │
└──────────────┘         │ possible_issue   │         │──────────────────│
                         │ created_at       │         │ id (PK)          │
                         └──────────────────┘         │ version          │
                                                       │ model_type       │
┌──────────────────┐                                   │ food_type        │
│  datasets        │                                   │ dataset_id       │
│──────────────────│                                   │ dataset_label    │
│ id (PK)          │                                   │ is_development_  │
│ name             │                                   │   model          │
│ food_type        │                                   │ is_active        │
│ description      │                                   │ file_path        │
│ file_path        │                                   │ pca_components   │
│ is_development_  │                                   │ svm_kernel       │
│   data           │                                   │ classes (JSON)   │
│ sample_count     │                                   │ evaluation_      │
│ class_           │                                   │   metrics (JSON) │
│   distribution   │                                   │ training_sample_ │
│   (JSON)         │                                   │   count          │
│ channel_count    │                                   │ trained_at       │
│ imported_at      │                                   │ created_at       │
└──────────────────┘                                   └──────────────────┘
```

---

## Table Definitions

### `operators`

| Column       | Type        | Description                     |
|-------------|-------------|---------------------------------|
| id          | VARCHAR(64) | PK — operator/user identifier   |
| name        | VARCHAR(128)| Display name                    |
| created_at  | DATETIME    | UTC timestamp of creation       |

### `devices`

| Column          | Type        | Description                      |
|----------------|-------------|----------------------------------|
| id             | VARCHAR(64) | PK — device identifier (e.g. BLE MAC or DEV-001) |
| name           | VARCHAR(128)| Friendly name                    |
| sensor_type    | VARCHAR(64) | "AS7265x" or "AS7265x (Development Mode)" |
| channel_count  | INTEGER     | Always 18 for AS7265x            |
| firmware_version | VARCHAR(32)| ESP32 firmware version or "N/A" |
| registered_at  | DATETIME    | UTC timestamp                    |

### `test_records`

| Column              | Type        | Description                     |
|--------------------|-------------|---------------------------------|
| id                 | VARCHAR(64) | PK — format: "FS-{8 hex chars}" |
| operator_id        | VARCHAR(64) | FK → operators.id               |
| device_id          | VARCHAR(64) | FK → devices.id                 |
| food_type          | VARCHAR(64) | "Milk", "Cooking Oil", etc.     |
| source             | VARCHAR(32) | "BLE" or "DEVELOPMENT"          |
| timestamp          | DATETIME    | UTC acquisition timestamp       |
| validation_status  | VARCHAR(32) | "VALID", "WARNING", "INVALID"   |
| validation_warnings | TEXT       | JSON array of warning strings   |
| preprocessing_steps | TEXT       | JSON array of step descriptions |
| raw_channels       | JSON        | Array of {channel, wavelength, rawValue, processedValue} |
| pca_components     | TEXT        | JSON [pc1, pc2] values          |
| final_label        | VARCHAR(32) | "SAFE", "SUSPECTED", "ADULTERATED", "UNKNOWN" |
| possible_issue     | VARCHAR(256)| Human-readable issue description|
| created_at         | DATETIME    | UTC record creation timestamp   |

### `prediction_records`

| Column              | Type        | Description                     |
|--------------------|-------------|---------------------------------|
| id                 | INTEGER     | PK — auto-increment             |
| test_id            | VARCHAR(64) | FK → test_records.id (UNIQUE)   |
| model_id           | VARCHAR(64) | FK → ml_models.id               |
| raw_label          | VARCHAR(64) | Raw SVM prediction label        |
| predicted_label    | VARCHAR(32) | ResultEngine output label       |
| probability        | FLOAT       | P(predicted_class) from SVM     |
| confidence_tier    | VARCHAR(32) | "HIGH", "MEDIUM", "LOW"         |
| class_probabilities | JSON       | {class: probability} dict       |

### `ml_models`

| Column              | Type        | Description                     |
|--------------------|-------------|---------------------------------|
| id                 | VARCHAR(64) | PK — format: "model-{8 hex}"   |
| version            | VARCHAR(32) | "v0.1-dev", "v1.0", etc.       |
| model_type         | VARCHAR(64) | "SVM", "RF", etc.              |
| food_type          | VARCHAR(64) | Food category this model covers |
| dataset_id         | VARCHAR(64) | Reference to dataset used       |
| dataset_label      | VARCHAR(128)| Human label for training data   |
| is_development_model | BOOLEAN  | TRUE if trained on synthetic data |
| is_active          | BOOLEAN     | Whether this is the active model |
| file_path          | VARCHAR(512)| Path to .joblib pipeline file   |
| pca_components     | INTEGER     | PCA n_components used           |
| svm_kernel         | VARCHAR(32) | "rbf", "linear", etc.          |
| classes            | TEXT        | JSON list of class names        |
| evaluation_metrics | JSON        | CV accuracy, F1, confusion matrix |
| training_sample_count | INTEGER | Number of training samples      |
| trained_at         | DATETIME    | UTC training timestamp          |
| created_at         | DATETIME    | UTC record creation timestamp   |

### `datasets`

| Column              | Type        | Description                     |
|--------------------|-------------|---------------------------------|
| id                 | VARCHAR(64) | PK — format: "ds-{8 hex}"      |
| name               | VARCHAR(128)| Dataset display name            |
| food_type          | VARCHAR(64) | Primary food type or "Mixed"   |
| description        | TEXT        | Optional description            |
| file_path          | VARCHAR(512)| Path to CSV file                |
| is_development_data | BOOLEAN   | TRUE if synthetic                |
| sample_count       | INTEGER     | Total rows in dataset           |
| class_distribution | JSON        | {class: count} dict             |
| channel_count      | INTEGER     | Number of spectral channels (18)|
| imported_at        | DATETIME    | UTC import timestamp            |

---

## CSV Dataset Format

```csv
sampleId,foodType,label,ch1,ch2,ch3,ch4,ch5,ch6,ch7,ch8,ch9,ch10,ch11,ch12,ch13,ch14,ch15,ch16,ch17,ch18
S001,Milk,AUTHENTIC,8521,9234,10115,11489,13245,15012,16823,18534,20212,22492,24823,26498,28214,30011,32498,31497,29812,28009
S002,Milk,ADULTERATED,5198,5712,6289,7112,8198,9409,10612,11809,13008,14812,16409,17809,19198,20612,21998,21209,19798,18497
```

Required columns: `sampleId`, `foodType`, `label`, `ch1`…`ch18`

---

## Traceability Chain

Every test result can be traced back through the full chain:

```
TestRecord.id
    │
    ├── operator_id  → Operator.name
    ├── device_id    → Device.sensor_type, firmware_version
    ├── raw_channels → 18 raw spectral values (immutable)
    ├── preprocessing_steps → what was applied
    │
    └── PredictionRecord
            │
            ├── model_id → MLModel
            │       ├── version
            │       ├── dataset_label
            │       ├── is_development_model
            │       ├── pca_components
            │       ├── svm_kernel
            │       └── evaluation_metrics
            │
            ├── predicted_label
            ├── probability
            └── class_probabilities
```

Raw channel data is **never overwritten**. Processed values are stored
alongside raw values in the `raw_channels` JSON column.
