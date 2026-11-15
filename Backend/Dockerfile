FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app/Backend

COPY Backend/requirements-docker.txt /tmp/requirements.txt

RUN pip install --upgrade pip \
    && pip install -r /tmp/requirements.txt

COPY Backend/app /app/Backend/app

RUN mkdir -p /app/Data/processed

COPY Data/processed/astronaut_health_synthetic_data.csv \
     /app/Data/processed/astronaut_health_synthetic_data.csv

EXPOSE 8000

CMD ["sh", "-c", "python -m app.db.init_db && uvicorn app.main:app --host 0.0.0.0 --port 8000"]