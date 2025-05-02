-- Schema Initialization Script
-- This script creates the necessary tables and their structure

-- Connect to the database (this should be run after database creation)
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