# Docker Setup Guide

## Environment Configuration

### Port Management
Each environment uses different ports to avoid conflicts when running multiple environments on the same host.

#### Port Assignments
| Environment | Service    | Host Port | Container Port | Purpose                    |
|-------------|------------|-----------|----------------|----------------------------|
| Development | Frontend   | 3000      | 3000           | Next.js development server |
|             | PostgreSQL | 5432      | 5432           | Database access           |
| Staging     | Frontend   | 3001      | 3000           | Staging environment       |
|             | PostgreSQL | 5433      | 5432           | Staging database         |
| Production  | Frontend   | 3002      | 3000           | Production environment    |
|             | PostgreSQL | 5434      | 5432           | Production database      |

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
   - Update port mappings in docker-compose files if conflicts occur

3. Environment-specific configuration:
   - Each environment has its own network
   - Services within the same environment can communicate using container names
   - External access uses the mapped host ports

## Setup Instructions

[Previous content remains unchanged...] 