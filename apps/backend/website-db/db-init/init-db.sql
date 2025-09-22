-- Database Initialization Script

-- Create databases if they don't exist
CREATE DATABASE tsunaimi_dev;
CREATE DATABASE tsunaimi_staging;
CREATE DATABASE tsunaimi_prod;

-- Connect to development database
\c tsunaimi_dev

-- Create tables
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

-- Connect to staging database
\c tsunaimi_staging

-- Create the same tables in staging
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

-- Note: Production database initialization will be handled separately for security 