import { IAuthModel, IAuthToken } from "../../interface/authToken.interface";

export default function (this: IAuthModel, token: IAuthToken['token']) {
  return this.deleteOne({ token: token, purpose: 'forget-password' });
}
