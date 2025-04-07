-- Migration: Create contact submissions table
-- Up Migration
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

-- Down Migration
-- DROP TABLE IF EXISTS contact_submissions; 