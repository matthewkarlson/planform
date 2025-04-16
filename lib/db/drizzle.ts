import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/matthewkarlson/projects/saas-starter/.env.development.local' });

if (!process.env.NEON_POSTGRES_URL) {
  throw new Error('NEON_POSTGRES_URL environment variable is not set');
}

export const client = postgres(process.env.NEON_POSTGRES_URL);
export const db = drizzle(client, { schema });
