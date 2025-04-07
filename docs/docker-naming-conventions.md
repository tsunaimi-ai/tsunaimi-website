# Docker Naming Conventions

## Overview
This document outlines the naming conventions used for Docker resources in the TsunAImi project. These conventions ensure consistency and clarity across development, staging, and production environments.

## Container Names
Format: `tsunaimi-{service}-{environment}`

### Services
- `frontend`: Next.js frontend application
- `postgresql`: PostgreSQL database

### Environments
- `dev`: Development environment
- `prod`: Production environment

### Examples
```
tsunaimi-frontend-dev
tsunaimi-frontend-prod
tsunaimi-postgresql-dev
tsunaimi-postgresql-prod
```

## Image Names
Format: `tsunaimi/{service}:{tag}`

### Tags
- `latest`: Latest development version
- `{version}`: Specific version (e.g., `1.0.0`)

### Examples
```
tsunaimi/frontend:latest
tsunaimi/frontend:1.0.0
tsunaimi/postgresql:latest
tsunaimi/postgresql:1.0.0
```

## Network Names
Format: `tsunaimi-network-{environment}`

### Examples
```
tsunaimi-network-dev
tsunaimi-network-prod
```

## Volume Names
Format: `tsunaimi-{service}-data-{environment}`

### Examples
```
tsunaimi-postgresql-data-dev
tsunaimi-postgresql-data-prod
```

## Environment Files
Format: `.env.{environment}`

### Examples
```
.env.dev
.env.prod
```

## Docker Compose Files
Format: `docker-compose.{environment}.yml`

### Examples
```
docker-compose.dev.yml        # Default/development configuration
docker-compose.prod.yml   # Production overrides
```

## Decision Log

### 2024-04-02: Service Naming
- Decision: Use `frontend` instead of `web` for the Next.js application container
- Rationale:
  - Better reflects the microservices architecture
  - More specific to the service's purpose
  - Aligns with industry practices for frontend/backend separation
  - Clearly distinguishes from other services

- Decision: Use `postgresql` instead of `db` for the database container
- Rationale:
  - More specific to the database technology
  - Avoids ambiguity with other potential database services
  - Follows the principle of explicit naming 