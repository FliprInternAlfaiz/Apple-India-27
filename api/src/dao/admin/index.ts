import { createAdmin } from './createAdmin.dao';
import { findAdminByEmail } from './findAdminByEmail.dao';
import { findAdminById } from './findAdminById.dao';

export const adminDao = {
  findByEmail: findAdminByEmail,
  getById: findAdminById,
  create: createAdmin,
};
