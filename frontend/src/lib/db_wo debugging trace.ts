'use server';

import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

// Load the appropriate .env file
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config({ path: `.env.${env}` });
}

let pool: Pool | null = null;

/**
 * Get the environment-specific configuration
 * This follows the Next.js environment loading strategy
 */
function getEnvConfig(): PoolConfig {
  const config: PoolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true',
    // Add some reasonable defaults for a web application
    max: env === 'production' ? 50 : 20, // More connections for production
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  };

  // Validate required configuration
  const requiredFields = ['user', 'host', 'database', 'password'] as const;
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required database configuration: ${missingFields.join(', ')}. ` +
      `Make sure these are set in your ${env === 'development' ? '.env.local' : `.env.${env}`} file.`
    );
  }

  return config;
}

export async function getPool(): Promise<Pool> {
  if (pool) return pool;

  try {
    const config = getEnvConfig();
    pool = new Pool(config);

    // The pool will emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Don't let the application crash, but log the error
    });

    return pool;
  } catch (error) {
    console.error('Error creating database pool:', error);
    throw new Error('Failed to initialize database connection. Check your environment configuration.');
  }
}

export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const pool = await getPool();
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const pool = await getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Ensure the pool is properly closed when the application shuts down
process.on('SIGTERM', async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
}); 