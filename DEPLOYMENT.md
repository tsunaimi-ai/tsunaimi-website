# NAS Deployment Guide

## Architecture Overview
- PostgreSQL runs in Docker container on NAS (port 5532 for staging)
- Website files deployed directly on NAS
- Environment configuration via `.env.staging`

## Database Setup (Docker)
1. Connect to PostgreSQL container:
   ```bash
   docker exec -it [postgres-container-name] psql -U postgres
   ```

2. Create the staging database:
   ```sql
   CREATE DATABASE tsunaimi_staging;
   \c tsunaimi_staging
   ```

3. Run the initialization script:
   ```sql
   \i /path/to/init-db.sql
   ```

## Environment Configuration
1. Ensure `.env.staging` has correct Docker settings:
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=tsunaimi_staging
   DB_PORT=5532  # base + 100 for staging
   DB_SSL=false  # Since we're connecting locally on NAS
   ```

## Deployment Steps
1. Copy website files to NAS
   ```bash
   # Already done via TAR file
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Build the application
   ```bash
   npm run build
   ```

4. Start the server
   ```bash
   npm run start
   ```

## Verification
1. Check database connection:
   ```bash
   npm run db:test
   ```

2. Verify contact form submissions:
   ```bash
   npm run db:check
   ```

## Troubleshooting
- If database connection fails, verify Docker container is running:
  ```bash
  docker ps | grep postgres
  ```
- Check Docker container logs:
  ```bash
  docker logs [postgres-container-name]
  ```
- Verify port mapping:
  ```bash
  docker port [postgres-container-name]
  ```

## Rollback Procedure
1. Stop the application
2. Restore previous version from backup
3. Restart the application

## Notes
- Docker container persists data in a volume
- Port mapping follows the pattern:
  - Development: base + 0 (3000, 5432)
  - Staging: base + 100 (3100, 5532)
  - Production: base + 200 (3200, 5632)
- SSL is disabled for local Docker connections on NAS 