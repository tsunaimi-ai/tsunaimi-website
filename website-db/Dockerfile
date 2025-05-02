FROM postgres:16-alpine

# Create directories for initialization scripts and migrations
RUN mkdir -p /docker-entrypoint-initdb.d
RUN mkdir -p /migrations

# Copy initialization scripts
COPY db-init/01-create-database.sql /docker-entrypoint-initdb.d/
COPY db-init/02-create-users.sql /docker-entrypoint-initdb.d/

# Expose the port
EXPOSE 5432 