
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, health, alerts

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
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(alerts.router)

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
