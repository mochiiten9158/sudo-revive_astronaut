
import pandas as pd

from app.core.config import (
    CARDIOVASCULAR_FILE,
    SYNTHETIC_FILE
)


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
