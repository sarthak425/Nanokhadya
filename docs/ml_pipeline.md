# ML Pipeline — NanoTech Food Safety System

## Overview

The ML pipeline converts raw 18-channel AS7265x spectral readings into
food adulteration predictions. Every step is modular and configurable.

```
Raw 18-channel reading (AS7265x sensor counts)
              │
              ▼
    ┌─────────────────────┐
    │   DataValidator     │  18 channels, range, NaN, spike check
    └─────────┬───────────┘
              │ ValidationResult (VALID / WARNING / INVALID)
              ▼
    ┌─────────────────────────────┐
    │   SpectralPreprocessor      │
    │  1. Moving-average smoothing│  (window = 3)
    │  2. ALS baseline correction │  (λ=1e4, p=0.01)
    │  3. SNV normalization       │
    └─────────┬───────────────────┘
              │ feature_vector [18 floats]
              ▼
    ┌─────────────────────────────┐
    │   sklearn Pipeline          │
    │   StandardScaler            │  zero mean, unit variance
    │         ↓                   │
    │   PCA (n_components=2)      │  dimensionality reduction + visualization
    │         ↓                   │
    │   SVC(rbf, probability=True)│  classification
    └─────────┬───────────────────┘
              │ prediction + class probabilities
              ▼
    ┌─────────────────────────────┐
    │   ResultEngine              │
    │   Maps ML output →          │
    │   SAFE / SUSPECTED /        │
    │   ADULTERATED / UNKNOWN     │
    └─────────┬───────────────────┘
              │ TestResult
              ▼
         SQLite + UI
```

---

## Step 1: Data Validation

**Module:** `app/acquisition/data_validator.py`

Validation checks (in order):

| Check | Failure Action |
|-------|---------------|
| Exactly 18 channels | INVALID — abort |
| All numeric (no NaN, no Inf) | INVALID — abort |
| Range: 0 ≤ value ≤ 65535 | WARNING |
| No sudden spike (>3σ from neighbours) | WARNING |
| Duplicate timestamp detection | WARNING |
| Valid test ID format | WARNING |

Status codes:
- `VALID` — proceed
- `WARNING` — proceed with caution note
- `INVALID` — abort, save failed record

---

## Step 2: Preprocessing

**Module:** `app/processing/preprocessing.py`

Three sequential steps:

### 2.1 Moving-Average Smoothing

Reduces high-frequency noise while preserving spectral shape.
Window size = 3 (configurable).

```
smoothed[i] = mean(raw[i-1], raw[i], raw[i+1])
```

Edge channels use available neighbours.

### 2.2 Asymmetric Least Squares (ALS) Baseline Correction

Removes broad fluorescent background that can bias spectral shape.

Parameters:
- λ = 1×10⁴ (smoothness)
- p = 0.01 (asymmetry — favours negative residuals)
- Iterations = 10

See: Eilers & Boelens (2005). "Baseline Correction with Asymmetric
Least Squares Smoothing."

### 2.3 Standard Normal Variate (SNV) Normalization

Removes multiplicative scatter effects — critical for NIR spectroscopy
of food matrices with varying particle sizes and densities.

```
SNV(x) = (x - mean(x)) / std(x)
```

After SNV, each spectrum has mean = 0 and std = 1, making samples
directly comparable regardless of absolute intensity level.

---

## Step 3: StandardScaler

**Module:** sklearn `StandardScaler` inside the Pipeline

Before PCA, each feature (channel) is standardized across the training set:

```
x_scaled = (x - μ_train) / σ_train
```

The scaler is fitted on training data and stored inside the `.joblib`
pipeline file — identical transformation is applied at inference.

---

## Step 4: PCA (Principal Component Analysis)

**Module:** sklearn `PCA` inside the Pipeline

Reduces 18-dimensional spectral space to 2 principal components:

- **PC1** captures the largest variance direction (typically NIR vs UV separation)
- **PC2** captures the second largest variance direction

Why PCA?
1. Dimensionality reduction: 18 → 2 features for SVM
2. Visualization: scatter plot of training data clusters
3. Interpretability: PC1/PC2 loadings show which wavelengths drive classification

Current configuration: `n_components=2`

Explained variance is reported per model — development models typically
show high explained variance on synthetic data.

---

## Step 5: SVM (Support Vector Machine)

**Module:** sklearn `SVC` inside the Pipeline

Configuration:
- Kernel: **RBF** (Radial Basis Function) — default
- C: 1.0 (regularization — controls margin softness)
- probability: True (Platt scaling for class probabilities)
- class_weight: balanced (handles imbalanced datasets)

Why RBF?
- Food spectral classes are not linearly separable in PCA space
- RBF kernel handles non-linear decision boundaries effectively
- Works well with small datasets (typical for early-stage food safety research)

**Alternative kernels** (configurable):
- `linear` — fast, suitable when classes are well-separated
- `poly` — for polynomial boundaries
- `sigmoid` — less common for spectral data

---

## Step 6: ResultEngine

**Module:** `app/decision/result_engine.py`

Maps SVM output to application-level result:

| SVM Prediction | Probability | Result      |
|----------------|-------------|-------------|
| AUTHENTIC       | ≥ 0.70     | SAFE        |
| AUTHENTIC       | 0.50–0.70  | SUSPECTED   |
| ADULTERATED     | ≥ 0.70     | ADULTERATED |
| ADULTERATED     | 0.50–0.70  | SUSPECTED   |
| SUSPECTED       | any        | SUSPECTED   |
| any             | < 0.50     | UNKNOWN     |

Confidence tiers:
- HIGH: ≥ 0.80
- MEDIUM: 0.60–0.80
- LOW: < 0.60

---

## Model Storage

**Module:** `app/ml/model_registry.py`

Each trained model is stored as a versioned `.joblib` file:

```
data/models/
  model-{uuid}.joblib   ← sklearn Pipeline (Scaler + PCA + SVC)
  model-{uuid}.json     ← metadata (version, food type, metrics, etc.)
```

Metadata includes:
- model_id, version
- food_type, classes
- dataset_id, dataset_label
- pca_components, svm_kernel, svm_C
- training_sample_count
- is_development_model
- trained_at
- evaluation_metrics (CV accuracy, F1, precision, recall, confusion matrix)

---

## Model Evaluation

**Module:** `app/ml/evaluation.py`

Metrics computed during training:

| Metric | Method |
|--------|--------|
| CV Mean Accuracy | 5-fold cross-validation |
| CV Std Accuracy  | Std across 5 folds |
| Accuracy         | On held-out test set |
| Precision        | Per-class, macro average |
| Recall           | Per-class, macro average |
| F1 Score         | Per-class, macro average |
| Confusion Matrix | N×N label matrix |

⚠ **Development models** (trained on synthetic data) show artificially
high CV accuracy. These metrics are NOT representative of real performance.

Real metrics are only meaningful with:
- Real AS7265x sensor measurements
- Proper experimental design (randomised, replicated)
- External validation on unseen samples

---

## Configuration

Model hyperparameters are configurable at training time via the API:

```json
POST /api/models/train
{
  "datasetId":     "ds-xxxxxxxx",
  "pcaComponents": 2,
  "svmKernel":     "rbf",
  "svmC":          1.0
}
```

---

## Future Model Types

The architecture supports adding these without pipeline changes:

- **Random Forest** (sklearn `RandomForestClassifier`)
- **XGBoost** (`xgboost.XGBClassifier`)
- **Neural Networks** (sklearn `MLPClassifier` or PyTorch)

The `ModelPipeline` class in `model_pipeline.py` can be extended with
new estimators while keeping the `SensorDataSource → ResultEngine` flow
identical.
