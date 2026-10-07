import { Injectable } from '@nestjs/common';
import type { Model as ModelRow, Organisation } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { Model, ModelAlreadyExists, Task, UnknownOrganisation } from './model.js';

/** A row of the Model table with its organisation loaded (`include`). */
type ModelWithOrg = ModelRow & { org: Organisation };

/** What a client may change on an existing model. */
export type ModelPatch = Partial<Pick<Model, 'name' | 'task' | 'parameters' | 'license'>>;

/**
 * the given service, plus the creator stamped on each model.
 *
 * - A model points at an organisation that must already exist: the service
 *   throws `UnknownOrganisation`, the controller answers 422.
 * - An id is unique: `ModelAlreadyExists`, 409.
 * - `downloads` starts at 0 and is never set by a client.
 * - `toModel` is the boundary between the database and the domain: `task`
 *   narrowed, `null` turned into `undefined`, the organisation row turned
 *   into its slug. Everything is narrowed here, once.
 * - `include: { org: true }` on every read, otherwise the N+1 comes back.
 *
 * ⚠️ `create` checks then inserts: two queries. Two clients posting the same
 * id at the same instant both pass the check, and the second one hits the
 * unique constraint. The constraint is the real guarantee; catching that
 * Prisma error (code P2002) and answering 409 is the next step of a real
 * service. Kept simple here.
 */
@Injectable()
export class ModelsService {
  constructor(private readonly prisma: PrismaService) {}

  private toModel(row: ModelWithOrg): Model {
    return {
      id: row.id,
      name: row.name,
      org: row.org.slug,
      task: row.task as Task,
      parameters: row.parameters,
      downloads: row.downloads,
      license: row.license ?? undefined,
      createdBy: row.createdBy ?? undefined,
    };
  }

  async create(model: Omit<Model, 'downloads'>, createdBy?: string): Promise<Model> {
    const org = await this.prisma.organisation.findUnique({ where: { slug: model.org } });
    if (!org) throw new UnknownOrganisation(model.org);

    const existing = await this.prisma.model.findUnique({ where: { id: model.id } });
    if (existing) throw new ModelAlreadyExists(model.id);

    const { org: _slug, ...fields } = model;
    const row = await this.prisma.model.create({
      data: { ...fields, createdBy, orgId: org.id },
      include: { org: true },
    });
    return this.toModel(row);
  }

  /** Creates an organisation and its first model in one go. */
  async createWithOrganisation(
    organisation: { slug: string; name: string; country?: string },
    model: Omit<Model, 'downloads' | 'org'>,
    createdBy?: string,
  ): Promise<Model> {
    const org = await this.prisma.organisation.create({ data: organisation });
    const row = await this.prisma.model.create({
      data: { ...model, createdBy, orgId: org.id },
      include: { org: true },
    });
    return this.toModel(row);
  }

  async findAll(filters: { org?: string; task?: Task } = {}, _pagination?: PaginationQueryDto): Promise<Model[]> {
    const rows = await this.prisma.model.findMany({
      where: {
        ...(filters.org ? { org: { slug: filters.org } } : {}),
        ...(filters.task ? { task: filters.task } : {}),
      },
      include: { org: true },
      orderBy: { downloads: 'desc' },
    });
    return rows.map((row) => this.toModel(row));
  }

  async findOne(id: string): Promise<Model | null> {
    const row = await this.prisma.model.findUnique({
      where: { id },
      include: { org: true },
    });
    return row ? this.toModel(row) : null;
  }

  async update(id: string, patch: ModelPatch): Promise<Model | null> {
    const existing = await this.prisma.model.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await this.prisma.model.update({
      where: { id },
      data: patch,
      include: { org: true },
    });
    return this.toModel(row);
  }

  async remove(id: string): Promise<boolean> {
    const row = await this.prisma.model.findUnique({ where: { id } });
    if (!row) return false;

    await this.prisma.model.delete({ where: { id } });
    return true;
  }

  /** Used by the tests: models first, they point at organisations. */
  async clear(): Promise<void> {
    await this.prisma.model.deleteMany();
    await this.prisma.organisation.deleteMany();
  }
}
