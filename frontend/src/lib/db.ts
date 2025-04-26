'use server';

import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

// Get the environment from APP_ENV if available, fallback to NODE_ENV
const env = process.env.APP_ENV || process.env.NODE_ENV || 'development';
console.log('DEBUG - Current environment:', env);
console.log('DEBUG - Current working directory:', process.cwd());
console.log('DEBUG - Attempting to load:', `.env.website.${env}`);

if (env === 'development') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config({ path: `.env.website.${env}` });
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
    port: parseInt(process.env.DB_PORT_INTERNAL || '5432'),
    ssl: process.env.DB_SSL === 'true',
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
    DB_SSL_RAW: process.env.DB_SSL  // This will show us the exact value from env
  });

  // Validate required configuration
  const requiredFields = ['user', 'host', 'database', 'password'] as const;
  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required database configuration: ${missingFields.join(', ')}. ` +
      `Make sure these are set in your ${env === 'development' ? '.env.local' : `.env.website.${env}`} file.`
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