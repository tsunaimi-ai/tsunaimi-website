#!/bin/bash

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432 -U $DB_USER
do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# Create database if it doesn't exist
psql -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME"

# Run migrations
for migration in /docker-entrypoint-initdb.d/*.sql; do
  echo "Running migration: $migration"
  psql -U $DB_USER -d $DB_NAME -f "$migration"
done

echo "Database initialization complete!"

# Note: The internal container port is still 5432, but it's mapped to 5433 on the host
# This allows multiple PostgreSQL containers to run simultaneously without port conflicts 