import { Injectable } from '@nestjs/common';
import type { Organisation as OrganisationRow } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Organisation, OrganisationAlreadyExists } from './organisation.js';

/** Given. An organisation is created on purpose, never as a side effect of a model. */
@Injectable()
export class OrganisationsService {
  constructor(private readonly prisma: PrismaService) {}

  private toOrganisation(row: OrganisationRow): Organisation {
    return { slug: row.slug, name: row.name, country: row.country ?? undefined };
  }

  async findAll(): Promise<Organisation[]> {
    const rows = await this.prisma.organisation.findMany({ orderBy: { slug: 'asc' } });
    return rows.map((row) => this.toOrganisation(row));
  }

  async create(organisation: Organisation): Promise<Organisation> {
    const existing = await this.prisma.organisation.findUnique({ where: { slug: organisation.slug } });
    if (existing) throw new OrganisationAlreadyExists(organisation.slug);

    const row = await this.prisma.organisation.create({ data: organisation });
    return this.toOrganisation(row);
  }
}
