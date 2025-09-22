-- User Creation Script
-- This script creates the necessary database users and sets permissions

-- Create user if it doesn't exist
#!/usr/bin/env bash
set -e

# Connect as the superuser (POSTGRES_USER) to the just‐created database (POSTGRES_DB)
psql -v ON_ERROR_STOP=1 \
     --username "$POSTGRES_USER" \
     --dbname   "$POSTGRES_DB" <<-EOSQL

-- 1) Create the application user with the password you supplied via DB_PASSWORD
CREATE USER "${DB_USER}"
  WITH PASSWORD '${DB_PASSWORD}';

-- 2) Grant that user full rights on the database you created
GRANT ALL PRIVILEGES
  ON DATABASE "${POSTGRES_DB}"
  TO "${DB_USER}";

EOSQL
