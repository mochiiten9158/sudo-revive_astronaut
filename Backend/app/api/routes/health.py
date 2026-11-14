
from fastapi import APIRouter, HTTPException, Query
import pandas as pd

from app.services.data_service import (
    get_integrated_data,
    get_participants,
    get_subject_data,
    get_cardiovascular_data,
    get_cardiovascular_metrics,
    get_cardiovascular_summary
)

router = APIRouter(
    prefix="/api/health",
    tags=["Health"]
)


# --------------------------------------------------
# HELPER: CLEAN NaN VALUES FOR JSON
# --------------------------------------------------

def dataframe_to_records(data):

    clean_data = data.astype(object).where(
        pd.notna(data),
        None
    )

    return clean_data.to_dict(orient="records")


# --------------------------------------------------
# GENERAL HEALTH ENDPOINTS
# --------------------------------------------------

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

    return dataframe_to_records(data)


# --------------------------------------------------
# CARDIOVASCULAR ENDPOINTS
# NASA 2D ECHOCARDIOGRAPHY DATA
# --------------------------------------------------

@router.get("/cardiovascular/data")
def cardiovascular_data():

    try:
        data = get_cardiovascular_data()

        return {
            "source": "NASA 2D echocardiography dataset",
            "observations": len(data),
            "data": dataframe_to_records(data)
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/cardiovascular/metrics")
def cardiovascular_metrics():

    try:
        return {
            "metrics": get_cardiovascular_metrics()
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/cardiovascular/summary")
def cardiovascular_summary(
    metric: str = Query(
        ...,
        description="Exact cardiovascular measurement column name"
    )
):

    try:
        summary = get_cardiovascular_summary(metric)

        return {
            "metric": metric,
            "groups": summary
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
