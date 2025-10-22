import UserModel from "./User/User.model";
import OtpModel from "./Otp/Opt.model"
import tokenModel from "./Token/Token.model";
const models = {
  User: UserModel,
  Otp: OtpModel,
  token: tokenModel,
};

export default models;