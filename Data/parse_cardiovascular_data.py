
import pandas as pd
import numpy as np
from pathlib import Path

# ==================================================
# 1. FILE PATHS
# ==================================================

DATA_DIR = Path(".")

input_file = DATA_DIR / "BRSMCF_CFT70_2D_Echo_All"

output_file = DATA_DIR / "ASTRA_cardiovascular_2D_clean.csv"
missingness_file = DATA_DIR / "ASTRA_2D_missingness_report.csv"
quality_file = DATA_DIR / "ASTRA_2D_quality_report.txt"


# ==================================================
# 2. LOAD DATA
# ==================================================

df = pd.read_csv(input_file, encoding="utf-8-sig")

print("=" * 60)
print("ASTRA - 2D CARDIOVASCULAR DATA CLEANING")
print("=" * 60)

print("\nOriginal dimensions:", df.shape)
print("Original participants:", df["Subject"].nunique())


# ==================================================
# 3. STANDARDIZE COLUMN NAMES
# ==================================================

df.columns = (
    df.columns
    .str.strip()
    .str.replace(r"\s+", " ", regex=True)
)

# Remove accidental whitespace from text values
for col in df.select_dtypes(include="object").columns:
    df[col] = df[col].str.strip()


# ==================================================
# 4. CLEAN CATEGORICAL VARIABLES
# ==================================================

# Standardize test phase labels
df["Test_Phase"] = (
    df["Test_Phase"]
    .str.strip()
    .str.upper()
)

# Standardize treatment labels
df["Treatment"] = (
    df["Treatment"]
    .str.strip()
    .str.replace(r"\s+", " ", regex=True)
)

# Normalize day labels
def normalize_day(value):

    if pd.isna(value):
        return np.nan

    value = str(value).strip()
    normalized = value.lower().replace(" ", "")

    if normalized in [
        "0+4hr",
        "0+4hrs",
        "0+4hour",
        "0+4hours"
    ]:
        return "0 +4 hr"

    return value


df["Day"] = df["Day"].apply(normalize_day)


# ==================================================
# 5. CONVERT NUMERIC COLUMNS
# ==================================================

# Metadata columns that should not be treated as
# cardiovascular measurements
metadata_columns = [
    "ID",
    "Subject",
    "Treatment",
    "Test_Phase",
    "Day"
]

numeric_columns = [
    col for col in df.columns
    if col not in metadata_columns
]

# Convert measurements to numeric
conversion_errors = {}

for col in numeric_columns:

    original_nonmissing = df[col].notna().sum()

    df[col] = pd.to_numeric(
        df[col],
        errors="coerce"
    )

    new_missing = df[col].isna().sum()

    conversion_errors[col] = new_missing - (
        len(df) - original_nonmissing
    )


# Ensure identifiers are numeric
df["ID"] = pd.to_numeric(df["ID"], errors="coerce")
df["Subject"] = pd.to_numeric(df["Subject"], errors="coerce")


# ==================================================
# 6. VALIDATE IDENTIFIERS
# ==================================================

print("\nIDENTIFIER VALIDATION")

print("Missing record IDs:", df["ID"].isna().sum())
print("Duplicate record IDs:", df["ID"].duplicated().sum())

print("Missing participant IDs:", df["Subject"].isna().sum())

# Each participant should have one treatment assignment
treatment_counts = (
    df.groupby("Subject")["Treatment"]
    .nunique()
)

treatment_conflicts = treatment_counts[
    treatment_counts > 1
]

print("Participants with conflicting treatments:",
      len(treatment_conflicts))


# ==================================================
# 7. CHECK DUPLICATE OBSERVATIONS
# ==================================================

# A participant should have one record per
# test phase and measurement day.

duplicate_keys = [
    "Subject",
    "Test_Phase",
    "Day"
]

duplicates = df.duplicated(
    subset=duplicate_keys,
    keep=False
)

print("\nDUPLICATE OBSERVATIONS")
print("Duplicate rows:", duplicates.sum())

if duplicates.sum() > 0:
    print(df.loc[duplicates, duplicate_keys])


# ==================================================
# 8. CREATE CHRONOLOGICAL TIMEPOINT ORDER
# ==================================================

timepoint_order = {
    ("PRE_TEST", "2"): 1,
    ("IN_TEST", "7"): 2,
    ("IN_TEST", "70"): 3,
    ("POST_TEST", "0 +4 hr"): 4,
    ("POST_TEST", "3"): 5
}


def get_timepoint_order(row):

    key = (
        row["Test_Phase"],
        row["Day"]
    )

    return timepoint_order.get(key, 999)


df["Timepoint_order"] = df.apply(
    get_timepoint_order,
    axis=1
)

# Sort each participant's observations chronologically
df = df.sort_values(
    by=["Subject", "Timepoint_order"],
    na_position="last"
).reset_index(drop=True)


# ==================================================
# 9. MISSING VALUE ANALYSIS
# ==================================================

missingness = pd.DataFrame({
    "Column": df.columns,
    "Missing_Count": df.isna().sum().values,
    "Missing_Percentage": (
        df.isna().mean().values * 100
    )
})

missingness = missingness.sort_values(
    by="Missing_Percentage",
    ascending=False
)

missingness.to_csv(
    missingness_file,
    index=False
)

print("\nMISSING VALUE SUMMARY")
print(missingness.head(15).to_string(index=False))


# ==================================================
# 10. FLAG POTENTIAL OUTLIERS
# ==================================================

# Use the IQR rule as an exploratory screening method.
# Do not remove flagged observations automatically.

outlier_summary = []

for col in numeric_columns:

    q1 = df[col].quantile(0.25)
    q3 = df[col].quantile(0.75)

    iqr = q3 - q1

    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    outlier_mask = (
        (df[col] < lower_bound)
        | (df[col] > upper_bound)
    )

    outlier_summary.append({
        "Measurement": col,
        "Lower_IQR_Bound": lower_bound,
        "Upper_IQR_Bound": upper_bound,
        "Potential_Outliers": int(outlier_mask.sum())
    })

outlier_df = pd.DataFrame(outlier_summary)

print("\nPOTENTIAL OUTLIERS")
print(
    outlier_df.sort_values(
        "Potential_Outliers",
        ascending=False
    ).head(15).to_string(index=False)
)


# ==================================================
# 11. VERIFY TREATMENT DISTRIBUTION
# ==================================================

print("\nTREATMENT DISTRIBUTION")

print(
    df.groupby("Treatment")["Subject"]
    .nunique()
)


# ==================================================
# 12. VERIFY TIMEPOINT DISTRIBUTION
# ==================================================

print("\nTIMEPOINT DISTRIBUTION")

print(
    df.groupby(
        ["Test_Phase", "Day"]
    ).size()
)


# ==================================================
# 13. SAVE CLEANED DATASET
# ==================================================

df.to_csv(
    output_file,
    index=False,
    encoding="utf-8-sig"
)

print("\n" + "=" * 60)
print("CLEANING COMPLETED")
print("=" * 60)

print("Cleaned dimensions:", df.shape)
print("Unique participants:", df["Subject"].nunique())
print("Output file:", output_file.resolve())
print("Missingness report:", missingness_file.resolve())


# ==================================================
# 14. GENERATE QUALITY REPORT
# ==================================================

with open(quality_file, "w") as report:

    report.write("ASTRA 2D CARDIOVASCULAR DATA QUALITY REPORT\n")
    report.write("=" * 55 + "\n\n")

    report.write(f"Rows: {len(df)}\n")
    report.write(f"Columns: {len(df.columns)}\n")
    report.write(f"Participants: {df['Subject'].nunique()}\n")

    report.write(
        f"Duplicate record IDs: {df['ID'].duplicated().sum()}\n"
    )

    report.write(
        f"Duplicate participant/timepoint rows: {duplicates.sum()}\n"
    )

    report.write(
        f"Missing values across dataset: {df.isna().sum().sum()}\n\n"
    )

    report.write("Treatment distribution:\n")
    report.write(
        df["Treatment"].value_counts().to_string()
    )

    report.write("\n\nMissingness by measurement:\n")
    report.write(missingness.to_string(index=False))

    report.write("\n\nPotential outliers:\n")
    report.write(outlier_df.to_string(index=False))

print("Quality report:", quality_file.resolve())
print("\nAll output files generated.")