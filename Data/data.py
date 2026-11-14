
import pandas as pd
import numpy as np
from pathlib import Path

# ==================================================
# 1. CONFIGURATION
# ==================================================

DATA_DIR = Path(".")

INPUT_FILE = DATA_DIR / "BRSMCF_CFT70_2D_Echo_All"

SYNTHETIC_OUTPUT = (
    DATA_DIR / "ASTRA_synthetic_health_parameters.csv"
)

INTEGRATED_OUTPUT = (
    DATA_DIR / "ASTRA_demo_integrated_health_data.csv"
)

# Fixed seed ensures reproducible synthetic data
SEED = 42
rng = np.random.default_rng(SEED)


# ==================================================
# 2. LOAD REAL 2D DATA
# ==================================================

cv = pd.read_csv(INPUT_FILE, encoding="utf-8-sig")

# Keep only participant and timepoint metadata.
# Cardiovascular measurements remain in the original
# dataset and are not modified.

metadata = cv[
    ["Subject", "Treatment", "Test_Phase", "Day"]
].copy()

metadata = metadata.drop_duplicates().reset_index(drop=True)

print("Participants:", metadata["Subject"].nunique())
print("Participant-timepoint records:", len(metadata))


# ==================================================
# 3. DEFINE TIMEPOINTS
# ==================================================

def get_elapsed_days(row):

    phase = str(row["Test_Phase"]).upper()
    day = str(row["Day"]).strip().lower().replace(" ", "")

    if phase == "PRE_TEST":
        return 0.0

    if phase == "IN_TEST" and day == "7":
        return 7.0

    if phase == "IN_TEST" and day == "70":
        return 70.0

    if phase == "POST_TEST" and day in [
        "0+4hr", "0+4hrs", "0+4hour", "0+4hours"
    ]:
        return 70.0 + (4.0 / 24.0)

    if phase == "POST_TEST" and day == "3":
        return 73.0

    return np.nan


metadata["Elapsed_Day"] = metadata.apply(
    get_elapsed_days,
    axis=1
)

if metadata["Elapsed_Day"].isna().any():
    raise ValueError("An unrecognized timepoint was found.")


# ==================================================
# 4. DEFINE SYNTHETIC BASELINES PER PARTICIPANT
# ==================================================

subjects = metadata["Subject"].unique()

baseline = {}

for subject in subjects:

    baseline[subject] = {
        "bone_density": rng.normal(100, 3),
        "muscle_strength": rng.normal(100, 8),
        "muscle_mass": rng.normal(100, 5),
        "mobility": rng.normal(100, 7),

        "sleep": rng.normal(7.5, 0.5),
        "sleep_quality": rng.normal(80, 7),
        "fatigue": rng.normal(3, 1),
        "stress": rng.normal(3, 1),
        "mood": rng.normal(7, 1),
        "cognition": rng.normal(100, 5),

        "wbc": rng.normal(6.5, 0.8),
        "lymphocytes": rng.normal(2.0, 0.3),
        "crp": rng.lognormal(np.log(1.5), 0.3),
        "temperature": rng.normal(36.8, 0.15)
    }


# ==================================================
# 5. GENERATE SYNTHETIC HEALTH MEASUREMENTS
# ==================================================

records = []

for _, row in metadata.iterrows():

    subject = row["Subject"]
    treatment = row["Treatment"]
    day = row["Elapsed_Day"]

    b = baseline[subject]

    # Normalized progression through the 70-day
    # bed-rest analog period.
    progress = min(day / 70.0, 1.0)

    # ------------------------------------------------
    # A. MUSCULOSKELETAL HEALTH
    # ------------------------------------------------

    # Illustrative trends, not measured study outcomes.
    bone_density = (
        b["bone_density"]
        - 2.0 * progress
        + rng.normal(0, 0.6)
    )

    muscle_strength = (
        b["muscle_strength"]
        - 12.0 * progress
        + rng.normal(0, 3)
    )

    muscle_mass = (
        b["muscle_mass"]
        - 4.0 * progress
        + rng.normal(0, 1.5)
    )

    mobility = (
        b["mobility"]
        - 8.0 * progress
        + rng.normal(0, 3)
    )

    exercise_adherence = np.clip(
        rng.normal(85, 10),
        0,
        100
    )

    # ------------------------------------------------
    # B. BEHAVIORAL AND COGNITIVE HEALTH
    # ------------------------------------------------

    sleep_duration = np.clip(
        b["sleep"] - 0.4 * progress + rng.normal(0, 0.4),
        3,
        12
    )

    sleep_quality = np.clip(
        b["sleep_quality"] - 8 * progress + rng.normal(0, 5),
        0,
        100
    )

    fatigue = np.clip(
        b["fatigue"] + 2 * progress + rng.normal(0, 1),
        0,
        10
    )

    stress = np.clip(
        b["stress"] + 1.5 * progress + rng.normal(0, 1),
        0,
        10
    )

    mood = np.clip(
        b["mood"] - 1.0 * progress + rng.normal(0, 0.8),
        0,
        10
    )

    cognitive_performance = np.clip(
        b["cognition"] - 5 * progress + rng.normal(0, 3),
        0,
        120
    )

    # ------------------------------------------------
    # C. RADIATION AND ENVIRONMENTAL EXPOSURE
    # ------------------------------------------------

    # Arbitrary synthetic exposure index.
    # NOT a physical radiation dose or mSv estimate.

    daily_radiation_index = rng.uniform(0.5, 1.5)

    cumulative_radiation_index = (
        daily_radiation_index * day
    )

    cabin_co2 = np.clip(
        rng.normal(900 + 150 * progress, 150),
        400,
        2000
    )

    cabin_temperature = rng.normal(22.5, 0.8)

    cabin_humidity = np.clip(
        rng.normal(45, 6),
        20,
        70
    )

    # ------------------------------------------------
    # D. IMMUNE AND GENERAL HEALTH
    # ------------------------------------------------

    white_blood_cells = (
        b["wbc"] + 0.4 * progress + rng.normal(0, 0.5)
    )

    lymphocytes = (
        b["lymphocytes"] - 0.2 * progress
        + rng.normal(0, 0.2)
    )

    crp = max(
        0.1,
        b["crp"] + 0.5 * progress + rng.normal(0, 0.4)
    )

    body_temperature = (
        b["temperature"] + rng.normal(0, 0.15)
    )

    # Simulated symptom reporting.
    symptom_reported = rng.choice(
        [0, 1],
        p=[0.92, 0.08]
    )

    symptom_type = (
        rng.choice([
            "Headache",
            "Fatigue",
            "Nausea",
            "Muscle soreness",
            "Sleep disturbance"
        ])
        if symptom_reported
        else "None"
    )

    # ------------------------------------------------
    # E. STORE RECORD
    # ------------------------------------------------

    records.append({

        "Subject": subject,
        "Treatment": treatment,
        "Test_Phase": row["Test_Phase"],
        "Day": row["Day"],
        "Elapsed_Day": day,

        # Musculoskeletal
        "Bone_Density_Index_pct_Baseline": bone_density,
        "Muscle_Strength_Index_pct_Baseline": muscle_strength,
        "Muscle_Mass_Index_pct_Baseline": muscle_mass,
        "Mobility_Index_pct_Baseline": mobility,
        "Exercise_Adherence_pct": exercise_adherence,

        # Behavioral and cognitive
        "Sleep_Duration_hours": sleep_duration,
        "Sleep_Quality_Score": sleep_quality,
        "Fatigue_Score_0_10": fatigue,
        "Stress_Score_0_10": stress,
        "Mood_Score_0_10": mood,
        "Cognitive_Performance_Index": cognitive_performance,

        # Radiation and environment
        "Daily_Radiation_Exposure_Index_AU": daily_radiation_index,
        "Cumulative_Radiation_Exposure_Index_AU": cumulative_radiation_index,
        "Cabin_CO2_ppm": cabin_co2,
        "Cabin_Temperature_C": cabin_temperature,
        "Cabin_Humidity_pct": cabin_humidity,

        # Immune and general health
        "White_Blood_Cell_Count_10^9_L": white_blood_cells,
        "Lymphocyte_Count_10^9_L": lymphocytes,
        "CRP_mg_L": crp,
        "Body_Temperature_C": body_temperature,
        "Symptom_Reported": symptom_reported,
        "Symptom_Type": symptom_type,

        # Provenance
        "Data_Origin": "SYNTHETIC",
        "Is_Synthetic": True,
        "Random_Seed": SEED
    })


synthetic = pd.DataFrame(records)


# ==================================================
# 6. SAVE SYNTHETIC DATASET
# ==================================================

synthetic.to_csv(
    SYNTHETIC_OUTPUT,
    index=False,
    encoding="utf-8-sig"
)


# ==================================================
# 7. CREATE INTEGRATED DEMO DATASET
# ==================================================

# Merge with the original 2D data.
# This is for ASTRA dashboard development only.
# Original cardiovascular measurements are retained.

integrated = cv.merge(
    synthetic,
    on=["Subject", "Treatment", "Test_Phase", "Day"],
    how="left",
    validate="one_to_one"
)

integrated.to_csv(
    INTEGRATED_OUTPUT,
    index=False,
    encoding="utf-8-sig"
)


# ==================================================
# 8. VALIDATION
# ==================================================

print("\n" + "=" * 55)
print("SYNTHETIC DATA GENERATION COMPLETE")
print("=" * 55)

print("\nSynthetic dataset shape:", synthetic.shape)
print("Integrated dataset shape:", integrated.shape)

print("\nUnique participants:", synthetic["Subject"].nunique())

print("\nTreatment distribution:")
print(synthetic.groupby("Treatment")["Subject"].nunique())

print("\nTimepoint distribution:")
print(synthetic.groupby(
    ["Test_Phase", "Day"]
).size())

print("\nSynthetic provenance:")
print(synthetic["Data_Origin"].value_counts())

print("\nMissing values:")
print(synthetic.isna().sum().sum())

print("\nGenerated files:")
print(SYNTHETIC_OUTPUT.resolve())
print(INTEGRATED_OUTPUT.resolve())