'use server';

import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

// Load the appropriate .env file
const env = process.env.NODE_ENV || 'development';
console.log('DEBUG - Current NODE_ENV:', env);
console.log('DEBUG - Current working directory:', process.cwd());
console.log('DEBUG - Attempting to load:', `.env.${env}`);

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
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_INTERNAL_PORT || '5432'),
    ssl: process.env.POSTGRES_SSL === 'true',
    // Add some reasonable defaults for a web application
    max: env === 'production' ? 50 : 20, // More connections for production
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  };

  // Add debug logging
  console.log('DEBUG - Database config:', {
    user: config.user,
    host: config.host,
    database: config.database,
    port: config.port,
    ssl: config.ssl,
    POSTGRES_SSL_RAW: process.env.POSTGRES_SSL  // This will show us the exact value from env
  });

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
  const currentPool = await getPool();
  const client = await currentPool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const currentPool = await getPool();
  const client = await currentPool.connect();

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

// Test the database connection
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Ensure the pool is properly closed when the application shuts down
process.on('SIGTERM', async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
});