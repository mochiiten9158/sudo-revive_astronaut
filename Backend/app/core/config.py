
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

# Project root is two levels above this file:
# backend/app/core/config.py -> project root

PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATA_DIR = PROJECT_ROOT / "Data"

CARDIOVASCULAR_FILE = (
    DATA_DIR / "processed" /
    "ASTRA_cardiovascular_2D_clean.csv"
)

SYNTHETIC_FILE = (
    DATA_DIR / "raw" /
    "ASTRA_synthetic_health_parameters.csv"
)

APP_NAME = "ASTRA Health Monitoring API"
APP_VERSION = "1.0.0"

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)
