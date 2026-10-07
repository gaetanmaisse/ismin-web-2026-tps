/**
 * Given. Populates the database from `data/organisations.json`, then from
 * `data/models.json`: a model can only point at an organisation that exists.
 * Running it twice changes nothing.
 *
 *   npm run db:seed
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

interface OrganisationSeed {
  slug: string;
  name: string;
  country?: string;
}

interface ModelSeed {
  id: string;
  name: string;
  org: string;
  task: string;
  parameters: number;
  downloads: number;
}

async function main(): Promise<void> {
  const organisations = JSON.parse(await readFile('data/organisations.json', 'utf8')) as OrganisationSeed[];
  for (const organisation of organisations) {
    await prisma.organisation.upsert({
      where: { slug: organisation.slug },
      create: organisation,
      update: { name: organisation.name, country: organisation.country },
    });
  }

  const models = JSON.parse(await readFile('data/models.json', 'utf8')) as ModelSeed[];
  for (const { org, ...model } of models) {
    const organisation = await prisma.organisation.findUnique({ where: { slug: org } });
    if (!organisation) {
      console.warn(`⚠️  ${model.id}: unknown organisation ${org}, skipped`);
      continue;
    }
    const data = { ...model, orgId: organisation.id };
    await prisma.model.upsert({ where: { id: model.id }, create: data, update: data });
  }

  // TODO: seed the users from data/users.json once they live in the database

  console.log(`✅ ${organisations.length} organisations, ${models.length} models`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
