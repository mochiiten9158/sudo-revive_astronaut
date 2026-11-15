
from pathlib import Path

import numpy as np
import pandas as pd


# --------------------------------------------------
# PATHS
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]

INTEGRATED_FILE = (
    PROJECT_ROOT
    / "Data"
    / "processed"
    / "ASTRA_demo_integrated_health_data.csv"
)

OUTPUT_FILE = INTEGRATED_FILE

RNG = np.random.default_rng(101)

ASTRONAUT_ID = "A001"
OBSERVATIONS = 30


# --------------------------------------------------
# LOAD EXISTING INTEGRATED DATA
# --------------------------------------------------

if not INTEGRATED_FILE.exists():
    raise FileNotFoundError(INTEGRATED_FILE)

existing = pd.read_csv(INTEGRATED_FILE)

# Prevent accidental duplicate insertion.
if existing["Subject"].astype(str).eq(ASTRONAUT_ID).any():
    raise ValueError(
        "A001 already exists in the integrated dataset. "
        "No records were added."
    )

columns = existing.columns.tolist()


# --------------------------------------------------
# SYNTHETIC DATA GENERATION
# --------------------------------------------------

def noise(scale):
    return RNG.normal(0, scale)


records = []

cumulative_radiation = 0.0

for day in range(OBSERVATIONS):

    # Musculoskeletal
    bone = 100 - day * 0.045 + noise(0.15)
    strength = 100 - day * 0.12 + noise(0.5)
    muscle = 100 - day * 0.08 + noise(0.4)
    mobility = 100 - day * 0.10 + noise(0.5)

    adherence = np.clip(92 + noise(4), 0, 100)

    # Behavioral
    sleep = 7.5 + noise(0.4)
    sleep_quality = np.clip(8 + noise(0.5), 0, 10)
    fatigue = np.clip(2 + noise(0.5), 0, 10)
    stress = np.clip(2.5 + noise(0.5), 0, 10)
    mood = np.clip(8 + noise(0.5), 0, 10)
    cognitive = np.clip(95 + noise(2), 0, 100)

    # Radiation and environment
    daily_radiation = max(0, 0.8 + noise(0.08))
    cumulative_radiation += daily_radiation

    co2 = 900 + noise(60)
    temperature = 22 + noise(0.4)
    humidity = 45 + noise(3)

    # Immune
    wbc = 6.5 + noise(0.4)
    lymphocytes = 2.1 + noise(0.15)
    crp = max(0.1, 1.5 + noise(0.3))
    body_temperature = 36.8 + noise(0.1)

    symptom = 0
    symptom_type = None

    # ------------------------------------------------
    # INTENTIONAL DEMONSTRATION ANOMALIES
    # ------------------------------------------------

    if day >= 22:
        sleep = 4.5 + noise(0.2)
        sleep_quality = 3.5 + noise(0.3)
        fatigue = 8 + noise(0.3)
        stress = 7 + noise(0.3)
        adherence = 65 + noise(3)

    if day >= 25:
        co2 = 1750 + noise(40)
        cognitive = 78 + noise(2)

    if day >= 27:
        crp = 10 + noise(0.5)
        body_temperature = 38 + noise(0.1)
        symptom = 1
        symptom_type = "Synthetic test symptom"

    # ------------------------------------------------
    # Cardiovascular demonstration measurements
    # ------------------------------------------------

    cardio = {
        "Left Ventricular Diameter Diastole": 4.8 + noise(0.1),
        "Left Ventricular Diameter Systole": 3.1 + noise(0.1),
        "Pulmonic Valve Acceleration Time": 110 + noise(5),
        "Pulmonic Valve Ejection Time": 320 + noise(8),
        "Mitral E Wave Velocity": 0.85 + noise(0.05),
        "Mitral A Wave Velocity": 0.65 + noise(0.05),
        "Mitral Deceleration Time": 180 + noise(10),
        "Isovolumic Contraction Time": 55 + noise(4),
        "Ejection Time": 300 + noise(8),
        "Isovolumic Relaxation Time": 80 + noise(5),
        "Aortic Valve Close Open": 1 + noise(0.03),
        "Tricuspid E Velocity": 0.55 + noise(0.04),
        "Tricuspid A Velocity": 0.45 + noise(0.04),
        "Tricuspid Regurgitation": 0.1 + abs(noise(0.03)),
        "TDI Tricuspid Systole": 12 + noise(0.8),
        "TDI Tricuspid E Wave": 9 + noise(0.5),
        "TDI Tricuspid A Wave": 10 + noise(0.5),
        "TDI Right Heart Rate": 65 + noise(3),
        "TDI Basal Septal Systole": 8 + noise(0.5),
        "TDI Basal Septal E": 7 + noise(0.4),
        "TDI Basal Septal A": 8 + noise(0.4),
        "TDI Mitral Annular Systole": 9 + noise(0.5),
        "TDI Mitral Annular E": 8 + noise(0.4),
        "TDI Mitral Annular A": 9 + noise(0.4),
        "TDI Left Heart Rate": 65 + noise(3),
        "Color M-Mode Velocity Propagation Time": 45 + noise(3),
        "LVOT Velocity Time Integral": 20 + noise(1),
    }

    record = {
        "Subject": ASTRONAUT_ID,
        "Treatment": "SYNTHETIC_DEMO",
        "Test_Phase": "MISSION_SIMULATION",
        "Day": f"DAY_{day}",
        "Elapsed_Day": float(day),

        **cardio,

        "Bone_Density_Index_pct_Baseline": bone,
        "Muscle_Strength_Index_pct_Baseline": strength,
        "Muscle_Mass_Index_pct_Baseline": muscle,
        "Mobility_Index_pct_Baseline": mobility,
        "Exercise_Adherence_pct": adherence,

        "Sleep_Duration_hours": sleep,
        "Sleep_Quality_Score": sleep_quality,
        "Fatigue_Score_0_10": fatigue,
        "Stress_Score_0_10": stress,
        "Mood_Score_0_10": mood,
        "Cognitive_Performance_Index": cognitive,

        "Daily_Radiation_Exposure_Index_AU": daily_radiation,
        "Cumulative_Radiation_Exposure_Index_AU": cumulative_radiation,
        "Cabin_CO2_ppm": co2,
        "Cabin_Temperature_C": temperature,
        "Cabin_Humidity_pct": humidity,

        "White_Blood_Cell_Count_10^9_L": wbc,
        "Lymphocyte_Count_10^9_L": lymphocytes,
        "CRP_mg_L": crp,
        "Body_Temperature_C": body_temperature,

        "Symptom_Reported": symptom,
        "Symptom_Type": symptom_type,

        "Data_Origin": "SYNTHETIC",
        "Is_Synthetic": True,
        "Random_Seed": 101,
    }

    records.append(record)


# --------------------------------------------------
# ALIGN WITH EXISTING CSV SCHEMA
# --------------------------------------------------

demo = pd.DataFrame(records)

# Include every existing column, even if it is not
# populated by the synthetic generator.
demo = demo.reindex(columns=columns)

# Generate unique IDs without changing existing records.
if "ID" in columns:
    existing_ids = pd.to_numeric(
        existing["ID"], errors="coerce"
    ).dropna()

    next_id = int(existing_ids.max()) + 1 if not existing_ids.empty else 1
    demo["ID"] = range(next_id, next_id + len(demo))


# --------------------------------------------------
# APPEND AND SAVE
# --------------------------------------------------

combined = pd.concat(
    [existing, demo],
    ignore_index=True
)

combined = combined.sort_values(
    ["Subject", "Elapsed_Day"],
    kind="stable"
).reset_index(drop=True)

combined.to_csv(OUTPUT_FILE, index=False)

print("A001 successfully appended.")
print(f"Total observations: {len(combined)}")
print(f"Total columns: {len(combined.columns)}")
print(
    "A001 observations:",
    int(combined["Subject"].astype(str).eq(ASTRONAUT_ID).sum())
)
print(
    "Synthetic records:",
    int(combined["Is_Synthetic"].fillna(False).astype(bool).sum())
)
print(f"Saved: {OUTPUT_FILE}")
