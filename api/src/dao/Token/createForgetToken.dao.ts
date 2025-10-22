import { IAuthModel, IAuthToken } from "../../interface/authToken.interface";

export default function (
  this: IAuthModel,
  data: Pick<IAuthToken, 'userId' | 'token'>,
) {
  return this.create({ ...data, purpose: 'forget-password' });
}
