
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

# Project root is two levels above this file:
# backend/app/core/config.py -> project root

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATA_DIR = PROJECT_ROOT / "Data"

INTEGRATED_FILE = (
    DATA_DIR
    / "processed"
    / "ASTRA_demo_integrated_health_data.csv"
)

CARDIOVASCULAR_FILE = (
    DATA_DIR / "processed" /
    "ASTRA_cardiovascular_2D_clean.csv"
)

SYNTHETIC_FILE = (
    DATA_DIR / "processed" /
    "astronaut_health_synthetic_data.csv"
)

APP_NAME = "ASTRA Health Monitoring API"
APP_VERSION = "1.0.0"

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing from the environment.")