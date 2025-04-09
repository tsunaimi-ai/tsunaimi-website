# Docker Setup Guide

## Environment Configuration

### Port Management
Each environment uses different ports to avoid conflicts when running multiple environments on the same host. We use a systematic approach where staging ports are +100 from development, and production ports are +200 from development.

#### Port Ranges
| Environment | Service Type | Port Range | Example Services |
|-------------|--------------|------------|------------------|
| Development | Databases    | 5432-5429  | PostgreSQL       |
|             | APIs         | 8000-8099  | REST APIs        |
|             | Frontends    | 3000-3099  | Next.js          |
| Staging     | Databases    | 5532-5529  | PostgreSQL       |
|             | APIs         | 8100-8199  | REST APIs        |
|             | Frontends    | 3100-3199  | Next.js          |
| Production  | Databases    | 5632-5629  | PostgreSQL       |
|             | APIs         | 8200-8299  | REST APIs        |
|             | Frontends    | 3200-3299  | Next.js          |

#### Current Port Assignments
| Environment | Service    | Host Port | Container Port | Purpose                    |
|-------------|------------|-----------|----------------|----------------------------|
| Development | Frontend   | 3000      | 3000           | Next.js development server |
|             | PostgreSQL | 5432      | 5432           | Database access           |
| Staging     | Frontend   | 3100      | 3000           | Staging environment       |
|             | PostgreSQL | 5532      | 5432           | Staging database         |
| Production  | Frontend   | 3200      | 3000           | Production environment    |
|             | PostgreSQL | 5632      | 5432           | Production database      |

#### Configuration Files
Port mappings are defined in the respective docker-compose files:
- `docker-compose.dev.yml`: Development ports
- `docker-compose.staging.yml`: Staging ports
- `docker-compose.prod.yml`: Production ports

#### Important Notes
1. Internal container ports remain constant:
   - Frontend always uses port 3000 internally
   - PostgreSQL always uses port 5432 internally

2. Port conflicts:
   - Check if ports are available before starting services
   - Use `netstat` or `lsof` to check port usage
   - Follow the +100/+200 rule for staging/production ports

3. Environment-specific configuration:
   - Each environment has its own network
   - Services within the same environment can communicate using container names
   - External access uses the mapped host ports

## Setup Instructions

[Previous content remains unchanged...] 