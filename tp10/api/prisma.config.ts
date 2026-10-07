import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/** Given. Where the database is, and how to seed it. */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
});
