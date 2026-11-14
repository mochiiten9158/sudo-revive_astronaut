
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import (
    APP_NAME,
    APP_VERSION,
    FRONTEND_URL
)

from app.api.routes import health

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Astronaut health monitoring and decision support"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(health.router)


@app.get("/")
def root():

    return {
        "application": APP_NAME,
        "version": APP_VERSION,
        "status": "operational"
    }


@app.get("/api/status")
def status():

    return {
        "status": "online"
    }
