import { IAuthModel, IAuthToken } from "../../interface/authToken.interface";

export default function (this: IAuthModel, id: IAuthToken['id']) {
  return this.findByIdAndDelete(id);
}
