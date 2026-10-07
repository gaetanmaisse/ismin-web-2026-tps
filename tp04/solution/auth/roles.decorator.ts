import { SetMetadata } from '@nestjs/common';
import type { Role } from '../users.js';

export const ROLES_KEY = 'roles';

/** TP4 solution, step 4: declares which roles may call a route. Read by RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
