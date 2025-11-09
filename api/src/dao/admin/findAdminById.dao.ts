import models from '../../models';

export const findAdminById = async (id: string) => {
  return await models.Admin.findById(id);
};
