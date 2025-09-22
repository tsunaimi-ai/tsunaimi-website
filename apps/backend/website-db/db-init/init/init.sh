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

# Run initialization scripts in order
echo "Running database initialization scripts..."

# Create users and set permissions
echo "Creating users and setting permissions..."
psql -U $DB_USER -d $DB_NAME -f /docker-entrypoint-initdb.d/02-create-users.sql

# Create schema
echo "Creating schema..."
psql -U $DB_USER -d $DB_NAME -f /docker-entrypoint-initdb.d/10-initial-schema.sql

# Seed static data
echo "Seeding static data..."
psql -U $DB_USER -d $DB_NAME -f /docker-entrypoint-initdb.d/20-seed-static-data.sql

echo "Database initialization complete!"

# Note: The internal container port is still 5432, but it's mapped to 5433 on the host
# This allows multiple PostgreSQL containers to run simultaneously without port conflicts 