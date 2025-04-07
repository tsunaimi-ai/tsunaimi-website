import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export async function migrate(pool: Pool) {
  // Create migrations table if it doesn't exist
  await pool.query(MIGRATIONS_TABLE);

  // Get list of applied migrations
  const { rows: appliedMigrations } = await pool.query(
    'SELECT name FROM migrations ORDER BY id'
  );
  const appliedMigrationNames = new Set(appliedMigrations.map(m => m.name));

  // Get list of migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  // Apply pending migrations
  for (const file of migrationFiles) {
    if (!appliedMigrationNames.has(file)) {
      console.log(`Applying migration: ${file}`);
      
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await pool.query('BEGIN');
        await pool.query(migrationSQL);
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        await pool.query('COMMIT');
        console.log(`Successfully applied migration: ${file}`);
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`Failed to apply migration ${file}:`, error);
        throw error;
      }
    }
  }
}

export async function rollback(pool: Pool, steps: number = 1) {
  const { rows: migrations } = await pool.query(
    'SELECT name FROM migrations ORDER BY id DESC LIMIT $1',
    [steps]
  );

  for (const migration of migrations) {
    console.log(`Rolling back migration: ${migration.name}`);
    // Note: You'll need to implement the rollback SQL for each migration
    // This is just a placeholder for the structure
    await pool.query(
      'DELETE FROM migrations WHERE name = $1',
      [migration.name]
    );
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    migrate(new Pool()).catch(console.error);
} 