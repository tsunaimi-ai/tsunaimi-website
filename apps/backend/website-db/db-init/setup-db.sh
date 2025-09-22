#!/bin/bash

# Database Setup Script
# Usage: ./setup-db.sh [environment]
# Example: ./setup-db.sh staging

ENV=$1

if [ -z "$ENV" ]; then
    echo "Please specify environment (development/staging/production)"
    exit 1
fi

# Load environment variables
if [ -f "../.env.$ENV" ]; then
    source "../.env.$ENV"
else
    echo "Environment file .env.$ENV not found"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL client (psql) not found"
    exit 1
fi

echo "Setting up database for $ENV environment..."

# Run initialization scripts in order
echo "Creating databases..."
psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -f 01-create-database.sql

echo "Creating users and setting permissions..."
psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -f 02-create-users.sql

echo "Creating schema..."
psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -f 10-initial-schema.sql

echo "Seeding static data..."
psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -f 20-seed-static-data.sql

echo "Database setup complete for $ENV environment" 