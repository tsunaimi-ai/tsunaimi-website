# NAS Deployment Guide

## Architecture Overview
- PostgreSQL runs on NAS (ports: 5432 for system databases, 5433 for application databases)
- Website files deployed directly on NAS
- Environment configuration via `.env.staging`

## Database Setup
1. Connect to PostgreSQL:
   ```bash
   psql -U postgres -h localhost -p 5433
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
1. Ensure `.env.staging` has correct settings:
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=tsunaimi_staging
   DB_PORT=5433  # Application databases use port 5433
   DB_SSL=false  # Since we're connecting locally on NAS
   DB_PASSWORD=your_staging_password_here
   ```

## Database Users
- Database user is always `postgres` for both production and staging
- `tsunaimi_user` is the NAS system user for running deployment scripts
- Never use `tsunaimi_user` for database connections

## Port Configuration Notes
- Port 5432: Used by system databases (Synology services)
- Port 5433: Used by application databases (tsunaimi_staging, tsunaimi_postgresql_prod)
- This separation prevents conflicts between system and application databases

## Deployment Steps
1. Copy website files to NAS
   ```bash
   # Already done via TAR file
   ```