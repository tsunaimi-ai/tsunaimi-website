import { getPool, query } from './db';
import { migrate } from '../db/migrate';

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test connection
    const pool = await getPool();
    console.log('✅ Successfully connected to the database');

    // Test simple query
    const result = await query<{ now: Date }>('SELECT NOW()');
    console.log('✅ Successfully executed test query');
    console.log('Current database time:', result[0].now);

    // Run migrations
    await migrate(pool);

    // Test contact_submissions table exists
    const tableCheck = await query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contact_submissions'
      )`
    );
    
    if (tableCheck[0].exists) {
      console.log('✅ contact_submissions table exists');
      
      // Test table structure
      const columns = await query<{ column_name: string }>(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'contact_submissions'`
      );
      console.log('Table columns:', columns.map(c => c.column_name).join(', '));
    } else {
      console.error('❌ contact_submissions table does not exist after running migrations');
      process.exit(1);
    }

    // Close the pool
    await pool.end();
    console.log('✅ Successfully closed database connection');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection().catch(console.error); 