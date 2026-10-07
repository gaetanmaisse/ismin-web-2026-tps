import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.js';

/**
 * Given. Manages the database connection and exposes it to the whole
 * application through dependency injection.
 *
 * 💡 To see the SQL actually being executed, essential for step 7,
 *    uncomment the `log` option below and watch your terminal.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set: cp .env.example .env');

    super({
      adapter: new PrismaBetterSqlite3({ url }),
      // log: ['query'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
