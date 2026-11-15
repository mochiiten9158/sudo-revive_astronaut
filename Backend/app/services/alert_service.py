
import pandas as pd
import numpy as np

from app.services.data_service import get_astronaut_data


VALID_STATUSES = {"normal", "warning", "critical"}


def to_native(value):
    """Convert pandas/NumPy values into JSON-safe Python values."""
    if value is None:
        return None

    if isinstance(value, np.ndarray):
        return value.tolist()

    if isinstance(value, np.generic):
        value = value.item()

    if pd.isna(value):
        return None

    return value


def generate_alerts(
    astronaut_id: str,
    mission_day: int | None = None,
) -> dict:
    """
    Return dataset-reported alerts for one astronaut.

    If mission_day is provided, use the exact matching observation.
    Otherwise, use the latest recorded observation.
    """

    data = get_astronaut_data(astronaut_id)

    if data.empty:
        return {
            "observations_analyzed": 0,
            "status": "unknown",
            "mission_day": None,
            "phase": None,
            "alerts": [],
            "is_synthetic": True,
            "data_origin": None,
        }

    if mission_day is not None:
        selected = data[
            data["Mission_Day"] == mission_day
        ]

        if selected.empty:
            return {
                "observations_analyzed": len(data),
                "observation_found": False,
                "status": "unknown",
                "mission_day": mission_day,
                "phase": None,
                "alerts": [],
                "is_synthetic": True,
                "data_origin": None,
            }

        observation = selected.iloc[-1]

    else:
        observation = data.iloc[-1]

    status_value = to_native(observation.get("Status"))

    status_value = (
        str(status_value).strip().lower()
        if status_value is not None
        else "unknown"
    )

    if status_value not in VALID_STATUSES:
        status_value = "unknown"

    reasons_value = to_native(
        observation.get("Alert_Reasons")
    )

    alerts = []

    if reasons_value:
        reasons = [
            reason.strip()
            for reason in str(reasons_value)
            .replace("|", ";")
            .split(";")
            if reason.strip()
        ]

        for reason in reasons:
            alerts.append({
                "severity": status_value,
                "title": "Dataset-reported health flag",
                "message": reason,
                "mission_day": to_native(
                    observation.get("Mission_Day")
                ),
                "phase": to_native(
                    observation.get("Phase")
                ),
            })

    return {
        "observations_analyzed": len(data),
        "observation_found": True,
        "status": status_value,
        "mission_day": to_native(
            observation.get("Mission_Day")
        ),
        "phase": to_native(
            observation.get("Phase")
        ),
        "alerts": alerts,
        "is_synthetic": bool(
            to_native(observation.get("Is_Synthetic"))
        ),
        "data_origin": to_native(
            observation.get("Data_Origin")
        ),
    }
