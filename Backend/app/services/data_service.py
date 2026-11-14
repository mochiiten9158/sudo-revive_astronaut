
import pandas as pd

from app.core.config import (
    CARDIOVASCULAR_FILE,
    SYNTHETIC_FILE
)


# --------------------------------------------------
# DATA LOADING
# --------------------------------------------------

def load_cardiovascular_data():

    if not CARDIOVASCULAR_FILE.exists():
        raise FileNotFoundError(
            f"Missing file: {CARDIOVASCULAR_FILE}"
        )

    return pd.read_csv(CARDIOVASCULAR_FILE)


def load_synthetic_data():

    if not SYNTHETIC_FILE.exists():
        raise FileNotFoundError(
            f"Missing file: {SYNTHETIC_FILE}"
        )

    return pd.read_csv(SYNTHETIC_FILE)


# --------------------------------------------------
# INTEGRATED HEALTH DATA
# --------------------------------------------------

def get_integrated_data():

    cardio = load_cardiovascular_data()
    synthetic = load_synthetic_data()

    keys = [
        "Subject",
        "Treatment",
        "Test_Phase",
        "Day"
    ]

    return cardio.merge(
        synthetic,
        on=keys,
        how="left",
        validate="one_to_one"
    )


def get_participants():

    data = get_integrated_data()

    return sorted(
        data["Subject"].dropna().unique().tolist()
    )


def get_subject_data(subject_id):

    data = get_integrated_data()

    participant_data = data[
        data["Subject"] == subject_id
    ]

    return participant_data.sort_values(
        "Elapsed_Day"
    )


# --------------------------------------------------
# CARDIOVASCULAR ANALYSIS
# NASA 2D ECHOCARDIOGRAPHY DATA ONLY
# --------------------------------------------------

def get_cardiovascular_data():

    data = load_cardiovascular_data()

    return data.sort_values(
        ["Subject", "Timepoint_order"]
    )


def get_cardiovascular_metrics():

    data = get_cardiovascular_data()

    metadata_columns = {
        "ID",
        "Subject",
        "Treatment",
        "Test_Phase",
        "Day",
        "Elapsed_Day",
        "Timepoint_order"
    }

    metrics = []

    for column in data.columns:

        if column in metadata_columns:
            continue

        numeric_values = pd.to_numeric(
            data[column],
            errors="coerce"
        )

        if numeric_values.notna().any():
            metrics.append(column)

    return metrics


def get_cardiovascular_summary(metric):

    data = get_cardiovascular_data()

    available_metrics = get_cardiovascular_metrics()

    if metric not in available_metrics:
        raise ValueError(
            f"Invalid cardiovascular metric: {metric}"
        )

    data[metric] = pd.to_numeric(
        data[metric],
        errors="coerce"
    )

    group_columns = [
        "Treatment",
        "Test_Phase",
        "Day",
        "Timepoint_order"
    ]

    summary = (
        data.groupby(
            group_columns,
            dropna=False
        )[metric]
        .agg(
            mean="mean",
            std="std",
            n="count"
        )
        .reset_index()
    )

    summary = summary.sort_values(
        ["Timepoint_order", "Treatment"]
    )

    summary = summary.astype(object).where(
        pd.notna(summary),
        None
    )

    return summary.to_dict(
        orient="records"
    )