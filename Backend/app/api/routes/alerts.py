
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import get_current_astronaut
from app.services.alert_service import generate_alerts


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"],
)


@router.get("/me")
def get_my_alerts(
    mission_day: int | None = Query(
        default=None,
        description="Optional exact mission day to retrieve alerts for.",
    ),
    astronaut=Depends(get_current_astronaut),
):
    if not astronaut.dataset_subject_id:
        raise HTTPException(
            status_code=409,
            detail="No health dataset is linked to this astronaut account.",
        )

    result = generate_alerts(
        astronaut.dataset_subject_id,
        mission_day=mission_day,
    )

    if result["observations_analyzed"] == 0:
        raise HTTPException(
            status_code=404,
            detail="No health observations found for this astronaut.",
        )

    if not result.get("observation_found", True):
        raise HTTPException(
            status_code=404,
            detail=(
                f"No observation exists for mission day {mission_day}."
            ),
        )

    result["astronaut_id"] = astronaut.astronaut_code
    result["display_name"] = astronaut.display_name

    return result