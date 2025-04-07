'use server';

import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

// Load the appropriate .env file
const env = process.env.NODE_ENV || 'development';

// Debug all environment variables
console.log('DEBUG - Database Configuration:', {
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? '***' : undefined,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  POSTGRES_SSL: process.env.POSTGRES_SSL,
  NODE_ENV: process.env.NODE_ENV
});

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
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
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
    console.log('DEBUG - Missing database configuration:', missingFields);
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
    console.log('DEBUG - Creating new database pool with config:', {
      user: config.user,
      host: config.host,
      database: config.database,
      port: config.port
    });
    
    pool = new Pool(config);

    // The pool will emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    pool.on('error', (err) => {
      console.log('DEBUG - Database pool error:', err);
    });

    // Test the connection
    const client = await pool.connect();
    console.log('DEBUG - Successfully connected to database');
    client.release();

    return pool;
  } catch (error) {
    console.log('DEBUG - Error creating database pool:', error);
    throw new Error('Failed to initialize database connection. Check your environment configuration.');
  }
}

export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const pool = await getPool();
  try {
    console.log('DEBUG - Executing query:', { text, params: params?.map(p => typeof p === 'string' ? p.substring(0, 10) + '...' : p) });
    const result = await pool.query(text, params);
    console.log('DEBUG - Query executed successfully');
    return result.rows;
  } catch (error) {
    console.log('DEBUG - Query error:', error);
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