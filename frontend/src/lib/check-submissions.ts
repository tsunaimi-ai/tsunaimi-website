import { query, getPool } from './db';
import { Pool } from 'pg';

interface ContactSubmission {
    name: string;
    email: string;
    company: string;
    role: string;
    interest: string;
    message: string;
    created_at: Date;
    processed: boolean;
    processed_at?: Date;
    notes?: string;
}

async function checkSubmissions() {
    console.log('Fetching contact form submissions...\n');
    
    try {
        // Query all submissions, ordered by oldest first
        const submissions = await query<ContactSubmission>(
            'SELECT * FROM contact_submissions ORDER BY created_at ASC'
        );

        if (submissions.length === 0) {
            console.log('❌ No submissions found in the database.');
            return;
        }

        console.log(`✅ Found ${submissions.length} submission(s):\n`);
        
        // Display each submission in a readable format
        submissions.forEach((submission: ContactSubmission, index: number) => {
            // Number from 1 to N (oldest submission is #1)
            const submissionNumber = index + 1;
            console.log(`Submission #${submissionNumber}:`);
            console.log('------------------------');
            console.log(`Name: ${submission.name}`);
            console.log(`Email: ${submission.email}`);
            console.log(`Company: ${submission.company}`);
            console.log(`Role: ${submission.role}`);
            console.log(`Interest: ${submission.interest}`);
            console.log(`Message: ${submission.message}`);
            console.log(`Submitted at: ${submission.created_at}`);
            console.log(`Processed: ${submission.processed ? 'Yes' : 'No'}`);
            if (submission.processed && submission.processed_at) {
                console.log(`Processed at: ${submission.processed_at}`);
                console.log(`Notes: ${submission.notes || 'No notes'}`);
            }
            console.log('------------------------\n');
        });

    } catch (error) {
        console.error('Error fetching submissions:', error);
    } finally {
        // Close the database connection
        const pool = await getPool();
        await pool.end();
        console.log('✅ Database connection closed');
    }
}

// Run the check
checkSubmissions(); 