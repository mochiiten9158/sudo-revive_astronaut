
from fastapi import APIRouter, HTTPException

from app.services.data_service import (
    get_integrated_data,
    get_participants,
    get_subject_data
)

router = APIRouter(
    prefix="/api/health",
    tags=["Health"]
)


@router.get("/overview")
def get_health_overview():

    data = get_integrated_data()

    return {
        "participants": int(
            data["Subject"].nunique()
        ),
        "observations": len(data),
        "health_domains": [
            "Cardiovascular",
            "Musculoskeletal",
            "Behavioral",
            "Radiation and Environment",
            "Immune"
        ],
        "synthetic_records": int(
            data["Is_Synthetic"].sum()
        )
    }


@router.get("/participants")
def list_participants():

    return {
        "participants": get_participants()
    }


@router.get("/participants/{subject_id}")
def participant_health(subject_id: int):

    data = get_subject_data(subject_id)

    if data.empty:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

    return data.replace(
        {float("nan"): None}
    ).to_dict(orient="records")
