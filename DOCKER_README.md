# ASTRA — Docker Image and Deployment Instructions

This guide explains how to build ASTRA's Docker images, run the application locally, export the images for transfer, and load them on another computer.

ASTRA uses three Docker services:

| Service | Image | Purpose | Host access |
|---|---|---|---|
| Frontend | `sudo-revive_astronaut-frontend:latest` | React application served by Nginx | `http://localhost:8080` |
| Backend | `sudo-revive_astronaut-backend:latest` | FastAPI API | `http://localhost:8000` (loopback only) |
| Database | `postgres:16-alpine` | PostgreSQL database | Internal Compose network |

> **Important:** A Docker image archive contains application images, not the PostgreSQL data volume, environment files, or the complete deployment configuration. Those must be handled separately.

## Contents

- [Prerequisites](#prerequisites)
- [Build the images](#build-the-images)
- [Start and verify ASTRA](#start-and-verify-astra)
- [Export images for transfer](#export-images-for-transfer)
- [Prepare the deployment folder](#prepare-the-deployment-folder)
- [Run ASTRA on another computer](#run-astra-on-another-computer)
- [Transfer the database contents (optional)](#transfer-the-database-contents-optional)
- [Update the images](#update-the-images)
- [Troubleshooting](#troubleshooting)
- [Important safety notes](#important-safety-notes)

## Prerequisites

On the build computer:

- Docker Engine
- Docker Compose v2
- ASTRA source repository
- Valid local environment configuration

On the receiving computer:

- Docker Engine
- Docker Compose v2
- A compatible CPU architecture and operating system for the exported images
- The deployment files and environment configuration

The current images shown by the project were built for `linux/amd64`. A machine using a different architecture, such as ARM64, may require images built for that platform or an explicitly configured emulation layer.

## Build the images

Run these commands from the repository root:

```bash
docker compose build backend frontend
docker compose pull db
```

To force a clean rebuild of the application images:

```bash
docker compose build --no-cache backend frontend
```

The database image is pulled from the PostgreSQL image repository; it is not built from the ASTRA source tree.

## Start and verify ASTRA

Configure the required environment files before starting the services:

- Root `.env`: set `DB_PASSWORD` and any other root Compose variables required by the project.
- `Backend/.env`: provide the backend configuration expected by the application.

Use the repository's example files as templates when available. Do not share real environment files or secrets.

Start the services:

```bash
docker compose up -d
```

Check status:

```bash
docker compose ps
```

Check backend status:

```bash
curl http://localhost:8000/api/status
```

Expected status response:

```json
{"status":"online"}
```

Open the frontend:

<http://localhost:8080>

View logs:

```bash
docker compose logs --tail=100
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker compose logs --tail=100 db
```

Stop the services without deleting the database volume:

```bash
docker compose down
```

**Do not use `docker compose down -v`** unless you intend to permanently remove the named PostgreSQL volume.

## Export images for transfer

The Compose project currently names its application images:

- `sudo-revive_astronaut-frontend:latest`
- `sudo-revive_astronaut-backend:latest`
- `postgres:16-alpine`

Create an archive directory:

```bash
mkdir -p ~/astra-docker-share
```

Export the images:

```bash
docker save \
  sudo-revive_astronaut-frontend:latest \
  sudo-revive_astronaut-backend:latest \
  postgres:16-alpine \
  | gzip > ~/astra-docker-share/astra-docker-images.tar.gz
```

Check that the archive exists and note its size:

```bash
ls -lh ~/astra-docker-share/astra-docker-images.tar.gz
```

The archive can be copied to another computer using a USB drive, secure file transfer, or another suitable transfer method.

### Verify the archive

To inspect the image archive without loading it, list its contents:

```bash
gzip -dc ~/astra-docker-share/astra-docker-images.tar.gz | tar -tf - | head
```

To load the images on the build computer as a test:

```bash
docker load -i ~/astra-docker-share/astra-docker-images.tar.gz
```

`docker load` imports image layers and tags. It does not start containers.

## Prepare the deployment folder

For an image-based transfer, provide the receiving computer with:

```text
ASTRA-deployment/
├── astra-docker-images.tar.gz
├── docker-compose.yml
├── .env.example
└── Backend/
    └── .env.example
```

Include the actual example files only if they exist in the repository. The recipient creates their own `.env` and `Backend/.env` from those templates.

The current repository `docker-compose.yml` contains `build:` instructions. That is appropriate when the source code is present, but an image-only deployment should avoid triggering a build. The recipient can use the existing Compose file with `--no-build` and the same Compose project name used to create the exported image tags.

The image tags above were generated with the Compose project name `sudo-revive_astronaut`. To make Compose look for those exact tags on the receiving computer, use `-p sudo-revive_astronaut` in the commands below. If the project was built under a different Compose project name, export the corresponding actual image names instead.

## Run ASTRA on another computer

1. Install Docker Engine and Docker Compose v2.
2. Copy the deployment folder to the computer.
3. Create the required environment files from the example templates.
4. Set a strong local `DB_PASSWORD` in the root `.env`.
5. Configure `Backend/.env` with the backend settings required by the application.
6. Open a terminal in the deployment folder.

Load the images:

```bash
docker load -i astra-docker-images.tar.gz
```

Start the services without rebuilding:

```bash
docker compose -p sudo-revive_astronaut up -d --no-build
```

Check the services:

```bash
docker compose -p sudo-revive_astronaut ps
```

Open:

<http://localhost:8080>

Check the backend from the host:

```bash
curl http://localhost:8000/api/status
```

### First launch and database initialization

The image archive does not contain the original PostgreSQL volume. On a new computer, PostgreSQL starts with a new, empty volume. Whether the application automatically initializes its schema or requires a separate initialization step depends on the current backend startup and database initialization code.

If the receiving computer needs the same demonstration accounts and database contents as the original computer, transfer and restore a PostgreSQL backup as described below. Do not assume that loading the images copies the database.

## Transfer the database contents (optional)

To transfer the existing PostgreSQL data, create a database dump on the original computer.

The following example uses `pg_dump` inside the running database container. It writes a custom-format dump to the host:

```bash
docker compose exec -T db sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > astra_backup.dump
```

Verify that the file exists:

```bash
ls -lh astra_backup.dump
```

Transfer `astra_backup.dump` securely with the deployment folder. It may contain account and application data; treat it as private.

On the receiving computer, first start the database service:

```bash
docker compose -p sudo-revive_astronaut up -d db
```

Wait until PostgreSQL is healthy:

```bash
docker compose -p sudo-revive_astronaut ps
```

Then restore the dump into the intended database. The exact restore procedure depends on whether the target database is empty and whether its schema or roles already exist. For a fresh database, a typical custom-format restore is:

```bash
docker compose -p sudo-revive_astronaut exec -T db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' \
  < astra_backup.dump
```

If the target database already contains tables or data, do not run a restore blindly: first take a backup and determine whether the restore should clean, replace, or merge existing objects. Database roles, extensions, and ownership may also need separate handling.

## Update the images

When source code changes on the build computer, rebuild the application images:

```bash
docker compose build backend frontend
```

Export a fresh archive using the image names listed above:

```bash
docker save \
  sudo-revive_astronaut-frontend:latest \
  sudo-revive_astronaut-backend:latest \
  postgres:16-alpine \
  | gzip > ~/astra-docker-share/astra-docker-images.tar.gz
```

Transfer the new archive to the receiving computer. Load it:

```bash
docker load -i astra-docker-images.tar.gz
```

Recreate the application containers:

```bash
docker compose -p sudo-revive_astronaut up -d --no-build --force-recreate
```

The named database volume is retained unless explicitly removed.

## Troubleshooting

### `no such image`

List the actual image names:

```bash
docker compose images
docker image ls
```

The default Compose-generated image names include the project name. Use the exact repository and tag shown by Docker.

### Compose tries to build an image

Use `--no-build` when running an image-only deployment:

```bash
docker compose -p sudo-revive_astronaut up -d --no-build
```

The matching image tags must already have been loaded.

### Frontend opens but API requests fail

Check service health and logs:

```bash
docker compose -p sudo-revive_astronaut ps
docker compose -p sudo-revive_astronaut logs --tail=100 backend
docker compose -p sudo-revive_astronaut logs --tail=100 frontend
```

Confirm that the backend environment file is configured and that the database is healthy. Also check the frontend's API URL/proxy configuration if the browser cannot reach the API.

### Port 8080 is already in use

Stop the conflicting service or change the frontend host-port mapping in the deployment Compose configuration. If you change the mapping, open the corresponding new port in the browser.

### Database data is missing

Docker image archives do not include named volumes. Restore a PostgreSQL dump or initialize the application database on the new host.

### Docker permission denied on Linux

Depending on the Linux installation, the current user may need Docker group membership or to run Docker commands with appropriate privileges. Follow the Docker Engine installation guidance for that operating system.

## Important safety notes

- Never distribute `.env`, `Backend/.env`, credentials, JWT signing secrets, or access tokens.
- Use unique passwords and secrets on each installation.
- Database dumps may contain personal or sensitive application records. Transfer them securely and include only data you are authorized to share.
- The backend is currently published on `127.0.0.1:8000`, while the frontend is published on port `8080`. Review network exposure before using ASTRA on a shared network.
- ASTRA is a prototype using synthetic demonstration data; it is not a certified medical device or a clinically validated decision-support system.
