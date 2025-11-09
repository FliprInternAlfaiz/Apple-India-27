import models from "../../models";


export const createAdmin = async (adminData: {
  email: string;
  password: string;
}) => {
  return await models.Admin.create(adminData);
};
