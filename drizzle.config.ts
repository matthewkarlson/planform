import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.LOCAL_POSTGRES_URL || process.env.NEON_POSTGRES_URL!,
  },
} satisfies Config;
