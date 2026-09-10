# NanoKhadya-Check (SIH Problem Statement 26235)
## Portable Nano-Engineered Rapid Food Testing Kit for On-Site Detection of Food Adulterants and Contaminants
**Ministry of Food Processing Industries (MoFPI) | Hardware Category**

---

## System Overview
NanoKhadya-Check is an integrated on-site food adulterant screening platform combining:
1. **Disposable Multiplex Test Cartridge (μPAD)**: 6-zone paper microfluidic strip featuring:
   * **Zone 1: Melamine** — Citrate-stabilized Gold Nanoparticles (AuNPs, 13nm; LSPR wine-red to blue shift).
   * **Zone 2: Hydrogen Peroxide ($H_2O_2$)** — $Fe_3O_4$ / Prussian Blue Peroxidase Nanozyme + TMB (colorless to sky-blue).
   * **Zone 3: Synthetic Urea** — Urease + Phenol Red/BTB chromogenic matrix (enzymatic pH shift yellow to magenta).
   * **Zone 4: Starch & Dextrin** — Lugol Iodine-PVP Nanocomposite (amylose inclusion complex turning inky-black).
   * **Zone 5: Neutralizers & Detergents** — Bromocresol Purple & Surfactant tracking dye (alkali pH and surfactant migration).
   * **Zone 6: Process Flow Control & Reference Standard** — Certified white tile for run-to-run camera normalization and capillary wetting confirmation.
2. **Portable Optical Reader**:
   * ESP32-S3-WROOM-1 microcontroller with OV2640 camera.
   * Closed dark optical chamber with 4x high-CRI ($>95$) 4500K neutral white LEDs on a constant-current driver.
   * Locked exposure, locked gain, and locked white balance to eliminate ambient lighting variance.
   * 1.3" I2C OLED display and piezo buzzer for field status feedback.
3. **Computer Vision & Calibration Engine (FastAPI / OpenCV / NumPy)**:
   * ArUco/contour perspective homography rectification.
   * von Kries white balance correction using the on-cartridge Zone 6 standard.
   * CIE $L^*a^*b^*$ color space transformation and Euclidean $\Delta E_{ab}^*$ distance calculation.
   * 4-Parameter Logistic (4PL) regression for quantitative estimation.
4. **Spring Boot 3 / Java 21 Enterprise Core**:
   * FSSAI statutory regulatory decision matrix.
   * Spring Security + JWT authentication.
   * Device telemetry, cartridge lifecycle tracking, and immutable audit logs.
   * MySQL 8.0 schema (with embedded H2 compatibility for instant local zero-setup dev).
5. **React 19 Dashboard**:
   * Live test execution runner with real-time well transition animations.
   * Official printable Food Safety Screening Certificate.
   * National grid analytics, geolocation tracking, and cartridge inventory.

---

## Directory Structure
```
food-adulterant/
├── backend/                   # Spring Boot 3 (Java 21) REST API
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/nanokhadya/
│       │   ├── NanoKhadyaApplication.java
│       │   ├── config/        # Security, JWT, OpenAPI
│       │   ├── controller/    # Auth, Tests, Devices, Cartridges, Analytics
│       │   ├── dto/           # Request and response models
│       │   ├── model/         # JPA entities (User, Device, Cartridge, Analyte, etc.)
│       │   ├── repository/    # Spring Data JPA repositories
│       │   └── service/       # FSSAI Decision Engine, TestSession, Auth, etc.
│       └── test/java/com/nanokhadya/
│           └── DecisionEngineServiceTest.java
├── cv-service/                # Python Computer Vision & Calibration Microservice
│   ├── requirements.txt
│   ├── main.py                # FastAPI endpoint
│   ├── calibration.py         # CIELAB, Delta-E, and 4PL regression algorithms
│   ├── image_processor.py     # Homography, ROI extraction, white standard normalization
│   └── test_calibration.py    # Math unit tests
├── firmware/                  # ESP32-S3 Hardware Firmware
│   └── nano_khadya_reader/
│       └── nano_khadya_reader.ino
└── frontend/                  # React 19 + TypeScript + Vite Dashboard
    ├── package.json
    ├── src/
    │   ├── App.tsx
    │   ├── index.css          # Glassmorphic responsive design system
    │   ├── types.ts           # Data models
    │   ├── mockData.ts        # Pre-seeded test sessions & devices
    │   └── components/        # Dashboard, NewTest, Certificate, History, Analytics
```

---

## Quick Start Guide

### 1. Spring Boot Backend
```bash
cd backend
# Run test suite
mvn test
# Start backend on http://localhost:8080 (Swagger UI at http://localhost:8080/swagger-ui.html)
mvn spring-boot:run
```

### 2. Python Computer Vision Engine
```bash
cd cv-service
pip install -r requirements.txt
python test_calibration.py
python main.py
# Runs on http://localhost:8000
```

### 3. React Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173 in browser
```

---

## SIH Jury Demonstration Workflow
1. Open the **React Dashboard** (`http://localhost:5173`).
2. Click **"Run New Test"**.
3. Under *Hackathon Demonstration Preset*, select an adulterant condition:
   * *Milk Spiked with Melamine (5.2 ppm)*
   * *Milk Spiked with Hydrogen Peroxide (14 ppm)*
   * *Milk Spiked with Starch (0.35% w/v)*
   * *Milk Spiked with Synthetic Urea (1430 mg/L)*
   * *Pure Unadulterated Cow Milk (Pass)*
4. Click **"Start Rapid Test Cycle"**.
5. Observe the 6-zone physical plate animation transition inside the closed chamber.
6. Review the resulting **Official FSSAI Screening Certificate** displaying exact $\Delta E$ values, CIELAB coordinates, regulatory thresholds, and pass/adulteration status.
7. Click **"Print Official Certificate"** to demonstrate one-click export for field inspectors.
