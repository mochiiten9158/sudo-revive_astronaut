# ASTRA
### Astronaut Status Tracking & Risk Analytics

ASTRA is an astronaut-facing health monitoring and decision-support application designed for long-duration space missions.

It provides astronauts with access to their personal health information, health trends, daily guidance, mission timeline, and individualized health baselines.

## Features

- Mission Overview
- Health Trends
- Daily Guidance
- Mission Timeline
- Personal Baseline
- Astronaut authentication
- Individualized health data
- Health alerts and trend analysis

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pandas

### Deployment
- Docker
- Docker Compose
- Nginx

## Prerequisites

- Docker Engine
- Docker Compose

## Setup

1. Clone the repository:

   ```bash
   git clone YOUR_REPOSITORY_URL
   cd sudo-revive_astronaut
cp .env.example .env
cp .env.example Backend/.env
docker compose up -d --build
docker compose up -d
