-- Test 1: Verify the table was created
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'contact_submission_versions'
) AS table_exists;

-- Test 2: Count existing submissions and their versions
SELECT 
    (SELECT COUNT(*) FROM contact_submissions) AS total_submissions,
    (SELECT COUNT(*) FROM contact_submission_versions) AS total_versions;

-- Test 3: Verify each submission has at least one version
SELECT 
    cs.id AS submission_id,
    COUNT(csv.id) AS version_count
FROM contact_submissions cs
LEFT JOIN contact_submission_versions csv ON cs.id = csv.submission_id
GROUP BY cs.id
HAVING COUNT(csv.id) = 0;

-- Test 4: Make a test update to verify the trigger works
-- First, let's get a submission to update
DO $$
DECLARE
    test_submission_id INTEGER;
BEGIN
    -- Get the first submission
    SELECT id INTO test_submission_id FROM contact_submissions LIMIT 1;
    
    -- Update it to test the trigger
    UPDATE contact_submissions 
    SET notes = 'Test update for versioning'
    WHERE id = test_submission_id;
END $$;

-- Test 5: Verify the new version was created
SELECT 
    submission_id,
    version,
    notes,
    created_at,
    updated_by
FROM contact_submission_versions
WHERE submission_id IN (
    SELECT id FROM contact_submissions LIMIT 1
)
ORDER BY version DESC; 