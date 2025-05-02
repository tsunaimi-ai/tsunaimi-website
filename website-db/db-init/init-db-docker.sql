-- Docker PostgreSQL Initialization Script
-- This script should be run from inside the Docker container
-- Usage: docker exec -i [postgres-container-name] psql -U postgres -f /docker-entrypoint-initdb.d/init-db-docker.sql

-- Create user and database if they don't exist
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'POSTGRES_USER') THEN
    EXECUTE format('CREATE USER %I WITH PASSWORD %L', :'POSTGRES_USER', :'POSTGRES_PASSWORD');
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ' || :'POSTGRES_DB' || ' WITH OWNER ' || :'POSTGRES_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'POSTGRES_DB')\gexec

-- Connect to the database
\c :POSTGRES_DB

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(255),
    interest VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    notes TEXT,
    phone_number VARCHAR(50)
);

-- Grant permissions on the table
GRANT ALL PRIVILEGES ON TABLE contact_submissions TO :POSTGRES_USER;
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO :POSTGRES_USER; 