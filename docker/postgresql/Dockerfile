FROM postgres:16-alpine

# Create directories for initialization scripts and migrations
RUN mkdir -p /docker-entrypoint-initdb.d
RUN mkdir -p /migrations

# Copy initialization scripts
COPY frontend/scripts/init-db-docker.sql /docker-entrypoint-initdb.d/
COPY frontend/src/db/migrations/*.sql /migrations/

# Expose the port
EXPOSE 5432 