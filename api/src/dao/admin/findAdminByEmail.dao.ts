import models from '../../models';

export const findAdminByEmail = async (email: string) => {
  return await  models.Admin.findOne({ email: email });
};
