-- !/usr/bin/env bash
-- Database Creation Script
set -e

-- This will create whatever database name you pass in via POSTGRES_DB
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
CREATE DATABASE ${POSTGRES_DB}
  WITH OWNER = $POSTGRES_USER
       ENCODING = 'UTF8'
       LC_COLLATE = 'en_US.utf8'
       LC_CTYPE = 'en_US.utf8'
       TEMPLATE = template0;
EOSQL
