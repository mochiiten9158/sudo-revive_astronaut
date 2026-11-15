# ASTRA — Astronaut Status Tracking & Risk Analytics

ASTRA is an astronaut-facing health monitoring and decision-support prototype designed to help astronauts review longitudinal health observations, understand changes relative to their own baselines, and access contextual, evidence-linked guidance.

The application brings several complementary views of astronaut health data into one interface. It is designed around the idea that measurements are more useful when they can be explored over time and interpreted in the context of an individual's prior observations and mission timeline.

> **Project status:** Research / demonstration prototype. ASTRA uses synthetic astronaut health data and is not a certified medical device, clinical decision system, or substitute for professional medical judgment or mission medical procedures.

## Contents

- [What ASTRA does](#what-astra-does)
- [Application modules](#application-modules)
- [Key design ideas](#key-design-ideas)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Data and limitations](#data-and-limitations)
- [Run ASTRA with Docker](#run-astra-with-docker)
- [Run ASTRA for development](#run-astra-for-development)
- [Project structure](#project-structure)
- [Accessibility and localization](#accessibility-and-localization)
- [Security and deployment notes](#security-and-deployment-notes)
- [Team and acknowledgements](#team-and-acknowledgements)

## What ASTRA does

ASTRA provides an astronaut-facing portal for reviewing health observations during a space mission. It combines:

- A mission-level summary of recorded health observations and alerts.
- Longitudinal charts for exploring health trends.
- Contextual guidance linked to NASA human-spaceflight research resources.
- A mission timeline for examining observations by mission day.
- Personal-baseline views for comparing measurements with an individual's historical data.

A shared mission-day selection keeps the relevant observation context synchronized as the astronaut moves between pages.

## Application modules

### 1. Mission Overview

The Mission Overview provides a consolidated view of the selected astronaut's recorded health information. It is intended as the starting point for understanding the latest available observation and the broader health context.

### 2. Health Trends

Health Trends presents health measurements across recorded observations. It supports longitudinal exploration so that users can inspect how measurements change rather than relying on a single value.

### 3. Daily Guidance

Daily Guidance presents contextual recommendations associated with observed health patterns. Guidance is rule-based and links to relevant NASA research or human-spaceflight health resources. It is informational and should be interpreted alongside approved mission procedures.

### 4. Mission Timeline

The Mission Timeline organizes observations in mission-day context. It helps users understand when observations occurred and navigate the available mission record.

### 5. Personal Baseline

Personal Baseline emphasizes individual comparison. Instead of treating one universal value as the only reference, it helps users inspect measurements in relation to their own recorded history.

## Key design ideas

### Longitudinal, individual-centered interpretation

Health observations are presented over time and, where applicable, compared with personal historical measurements. This supports a more contextual view than isolated readings.

### Shared mission-day context

The selected mission day is shared across relevant pages. Moving between views therefore preserves the observation being investigated.

### Evidence-linked guidance

Guidance items include explanatory context, a suggested next step, and links to relevant NASA resources. The recommendations are prototype rules, not automated diagnoses.

### Astronaut-facing experience

ASTRA is designed as an astronaut-facing application. The current application does not implement separate Mission Control accounts, roles, dashboards, or access workflows.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Visualization | Recharts and interactive frontend components |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Data preparation | Python and CSV-based synthetic data |
| Deployment | Docker, Docker Compose, Nginx |
| Source control | Git |

The frontend communicates with the backend through API services. The backend provides authenticated health and alert data endpoints and connects to PostgreSQL.

## Architecture

At a high level, ASTRA is composed of three Docker services:

1. **Frontend** — the browser-based React application, served by Nginx.
2. **Backend** — the FastAPI application that handles API requests and data access.
3. **Database** — PostgreSQL, which stores application data.

The Compose configuration defines the services and their dependencies. The backend waits for the database health check, and the frontend waits for the backend health check.

### Main API routes

The application currently uses authenticated endpoints including:

- `GET /api/status` — backend status check.
- `GET /api/health/me` — health observations for the authenticated user.
- `GET /api/alerts/me` — alerts for the authenticated user.

The exact available routes and request/response schemas are defined by the backend source code.

## Data and limitations

The demonstration dataset is located at:

`Data/processed/astronaut_health_synthetic_data.csv`

The known dataset contains 340 rows, 100 columns, 10 synthetic astronaut identifiers, and 34 observations per identifier. Its records are synthetic (`Is_Synthetic` is true and `Data_Origin` identifies the data as synthetic).

The dataset is not a collection of real astronaut medical records. It is included to demonstrate the interface, data processing, charts, mission-day navigation, and guidance workflow.

Some records are sparse after mission day 212. For that reason, the interface and project description should refer to the **latest recorded observation**, rather than implying that the displayed record represents the astronaut's current real-world health status.

ASTRA's current guidance logic uses text/rule matching against recorded alert reasons. It does not establish a diagnosis, replace a clinician, or validate the clinical significance of a measurement. NASA resource links provide context; they do not constitute NASA endorsement of ASTRA.

## Run ASTRA with Docker

Docker is the recommended way to run the integrated application.

### Prerequisites

- Docker Engine
- Docker Compose v2 (`docker compose`)
- The ASTRA repository

### Configure environment variables

The Compose configuration expects a root `.env` file containing the database password. It also loads backend settings from `Backend/.env`.

Use the repository's example environment files as templates if they are present:

- `.env.example` → `.env`
- `Backend/.env.example` → `Backend/.env`

Populate the required values locally. In particular, set `DB_PASSWORD` in the root `.env`. Do not commit or distribute real `.env` files, credentials, signing keys, or tokens.

### Start the application

From the repository root:

```bash
docker compose up -d --build
```

Check service status:

```bash
docker compose ps
```

Open the application:

- Frontend: <http://localhost:8080>
- Backend status endpoint: <http://localhost:8000/api/status>

The backend port is bound to `127.0.0.1` by the current Compose configuration, so it is available from the host machine but is not published on all network interfaces.

### Stop the application

```bash
docker compose down
```

This stops and removes the containers but preserves the named PostgreSQL volume.

> Do not use `docker compose down -v` unless you intentionally want to delete the database volume and its contents.

For prebuilt-image sharing, image export/import, and running ASTRA on another computer, see [`DOCKER_README.md`](DOCKER_README.md).

## Run ASTRA for development

The Docker workflow is the documented integrated run path. For local frontend or backend development, use the package/dependency instructions and configuration in the corresponding subdirectory.

Typical frontend commands, when dependencies are installed:

```bash
cd frontend
npm ci
npm run dev
```

The frontend development server may require an appropriate API base URL or proxy configuration to reach the backend. Check the current frontend Vite configuration and API service before changing that setting.

For backend development, create and activate a Python virtual environment, install the dependencies listed by the backend project, configure `Backend/.env`, and use the backend's documented FastAPI startup command. Consult the current backend dependency and application files for the exact command and required environment variables.

## Project structure

The repository includes the following major areas:

```text
.
├── Backend/                 # FastAPI backend and backend Dockerfile
├── Data/
│   └── processed/           # Processed demonstration dataset
├── frontend/                # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/      # Application and layout components
│   │   ├── context/          # Shared application contexts
│   │   ├── i18n/             # Translation resources
│   │   ├── pages/            # Main application pages
│   │   └── services/         # API client/services
│   └── Dockerfile
├── docker-compose.yml       # Integrated Docker services
├── .env.example             # Root environment template, if included
└── README.md
```

Some filenames or subdirectories may differ as the project evolves; the source tree is authoritative.

## Accessibility and localization

ASTRA includes English, Russian, and Chinese interface translations, along with user preferences for:

- Light and dark appearance settings.
- Text-size adjustments.
- Color-vision accessibility options.
- High contrast.
- Reduced motion.
- Enhanced keyboard focus visibility.

Preference state is shared across the application and persisted in browser local storage. The completeness of translation can vary for dynamic values returned by the API or embedded in source data.

## Security and deployment notes

- Never commit `.env`, `Backend/.env`, database dumps, credentials, signing keys, or access tokens.
- Use unique, strong secrets and database passwords outside local demonstrations.
- The current Compose file publishes the frontend on port `8080` and binds the backend to host loopback on port `8000`.
- Do not expose the prototype directly to the public internet without reviewing authentication, authorization, secret management, TLS, network exposure, logging, and operational security.
- Synthetic demonstration data should remain clearly identified as synthetic.
- Back up PostgreSQL data separately. A Docker image archive does not include the contents of a named database volume.

## Team and acknowledgements

ASTRA was developed for the NASA Space Apps Challenge. The project explores how visualization, longitudinal health data, individual baselines, and evidence-linked context can be combined in an astronaut-facing health monitoring prototype.
