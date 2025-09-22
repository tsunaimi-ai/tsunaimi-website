// Temporary stub for database functions until contact form is migrated to platform
// This allows the build to work while preserving the contact form code

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  // Temporary implementation - just return empty results
  console.warn('Database query called but database is disabled:', sql);
  return [] as T[];
}
