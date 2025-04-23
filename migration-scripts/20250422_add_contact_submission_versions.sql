-- Create a new table for versioning contact form submissions
CREATE TABLE IF NOT EXISTS contact_submission_versions (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES contact_submissions(id),
    version INTEGER NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    company VARCHAR(255),
    role VARCHAR(255),
    interest VARCHAR(255),
    message TEXT,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submission_versions_submission_id ON contact_submission_versions(submission_id);
CREATE INDEX IF NOT EXISTS idx_contact_submission_versions_version ON contact_submission_versions(version);

-- Create a function to handle versioning when a submission is updated
CREATE OR REPLACE FUNCTION create_contact_submission_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the next version number
    SELECT COALESCE(MAX(version), 0) + 1
    INTO NEW.version
    FROM contact_submission_versions
    WHERE submission_id = NEW.id;

    -- Insert the new version
    INSERT INTO contact_submission_versions (
        submission_id,
        version,
        name,
        email,
        company,
        role,
        interest,
        message,
        processed,
        processed_at,
        notes,
        created_by,
        updated_by
    ) VALUES (
        NEW.id,
        NEW.version,
        NEW.name,
        NEW.email,
        NEW.company,
        NEW.role,
        NEW.interest,
        NEW.message,
        NEW.processed,
        NEW.processed_at,
        NEW.notes,
        current_user,
        current_user
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically create versions when a submission is updated
DROP TRIGGER IF EXISTS contact_submission_version_trigger ON contact_submissions;
CREATE TRIGGER contact_submission_version_trigger
    AFTER UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION create_contact_submission_version();

-- Migrate existing data
INSERT INTO contact_submission_versions (
    submission_id,
    version,
    name,
    email,
    company,
    role,
    interest,
    message,
    processed,
    processed_at,
    notes,
    created_by,
    updated_by
)
SELECT 
    id,
    1,
    name,
    email,
    company,
    role,
    interest,
    message,
    processed,
    processed_at,
    notes,
    'migration',
    'migration'
FROM contact_submissions; 