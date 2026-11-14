
import pandas as pd


def calculate_baseline(
    data: pd.DataFrame,
    subject_id: int,
    measurement: str
):

    participant = data[
        data["Subject"] == subject_id
    ]

    baseline = participant[
        participant["Test_Phase"] == "PRE_TEST"
    ]

    values = baseline[measurement].dropna()

    if values.empty:
        return None

    return float(values.iloc[0])


def calculate_change_from_baseline(
    current_value: float,
    baseline_value: float
):

    if baseline_value == 0:
        return None

    return (
        (current_value - baseline_value)
        / abs(baseline_value)
    ) * 100
