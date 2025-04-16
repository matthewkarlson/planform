import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/matthewkarlson/projects/saas-starter/.env.local' });

console.log('LOCAL_POSTGRES_URL', process.env.LOCAL_POSTGRES_URL);
const databaseUrl = process.env.LOCAL_POSTGRES_URL || process.env.NEON_POSTGRES_URL;

if (!databaseUrl) {
  throw new Error('Neither LOCAL_POSTGRES_URL nor NEON_POSTGRES_URL environment variables are set');
}

export const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });
