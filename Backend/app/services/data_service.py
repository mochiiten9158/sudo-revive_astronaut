
import pandas as pd

from app.core.config import SYNTHETIC_FILE


def load_synthetic_data() -> pd.DataFrame:
    """Load the operational synthetic astronaut health dataset."""
    if not SYNTHETIC_FILE.exists():
        raise FileNotFoundError(
            f"Synthetic astronaut dataset not found: {SYNTHETIC_FILE}"
        )

    data = pd.read_csv(SYNTHETIC_FILE)

    required_columns = {
        "Astronaut_ID",
        "Name",
        "Phase",
        "Mission_Day",
        "Status",
        "Alert_Reasons",
        "Data_Origin",
        "Is_Synthetic",
    }

    missing = required_columns - set(data.columns)

    if missing:
        raise ValueError(
            f"Synthetic dataset is missing required columns: {sorted(missing)}"
        )

    return data


def get_astronaut_data(astronaut_id: str) -> pd.DataFrame:
    """Return observations belonging to exactly one astronaut."""
    data = load_synthetic_data()

    astronaut_data = data[
        data["Astronaut_ID"].astype(str) == str(astronaut_id)
    ].copy()

    if not astronaut_data.empty:
        astronaut_data["Mission_Day"] = pd.to_numeric(
            astronaut_data["Mission_Day"],
            errors="coerce",
        )

        astronaut_data = astronaut_data.sort_values(
            "Mission_Day"
        ).reset_index(drop=True)

    return astronaut_data
