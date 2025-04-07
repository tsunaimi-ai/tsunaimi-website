-- Docker PostgreSQL Initialization Script
-- This script should be run from inside the Docker container
-- Usage: docker exec -i [postgres-container-name] psql -U postgres -f /path/to/init-db-docker.sql

-- Create user and database
CREATE USER tsunaimi_postgres_user WITH PASSWORD 'tsunaimi_web_123';
CREATE DATABASE tsunaimi_postgresql_dev;
GRANT ALL PRIVILEGES ON DATABASE tsunaimi_postgresql_dev TO tsunaimi_postgres_user;

-- Connect to the new database
\c tsunaimi_postgresql_dev

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
GRANT ALL PRIVILEGES ON TABLE contact_submissions TO tsunaimi_postgres_user;
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO tsunaimi_postgres_user; 