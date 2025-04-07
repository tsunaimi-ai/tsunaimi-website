#!/bin/sh

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432 -U $POSTGRES_USER
do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# Create the database if it doesn't exist
psql -U $POSTGRES_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 || \
psql -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB"

# Connect to the database and run migrations
for migration in /migrations/*.sql; do
  echo "Running migration: $migration"
  psql -U $POSTGRES_USER -d $POSTGRES_DB -f "$migration"
done

echo "Database initialization complete!"

# Note: The internal container port is still 5432, but it's mapped to 5433 on the host
# This allows multiple PostgreSQL containers to run simultaneously without port conflicts 