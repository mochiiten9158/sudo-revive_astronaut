
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd

from app.core.dependencies import get_current_astronaut
from app.services.data_service import get_astronaut_data


router = APIRouter(prefix="/api/health", tags=["Health"])


def dataframe_to_records(data: pd.DataFrame):
    clean_data = data.astype(object).where(pd.notna(data), None)
    return clean_data.to_dict(orient="records")


@router.get("/me")
def get_my_health_data(
    astronaut=Depends(get_current_astronaut),
):
    dataset_id = astronaut.dataset_subject_id

    if not dataset_id:
        raise HTTPException(
            status_code=409,
            detail="No health dataset is linked to this astronaut account.",
        )

    data = get_astronaut_data(dataset_id)

    if data.empty:
        raise HTTPException(
            status_code=404,
            detail="No health observations found for this astronaut.",
        )

    synthetic_values = data["Is_Synthetic"].fillna(False).astype(bool)

    return {
        "astronaut_id": astronaut.astronaut_code,
        "display_name": astronaut.display_name,
        "dataset_subject_id": dataset_id,
        "observations": len(data),
        "data_origin": data["Data_Origin"].dropna().unique().tolist(),
        "is_synthetic": bool(synthetic_values.all()),
        "data": dataframe_to_records(data),
    }