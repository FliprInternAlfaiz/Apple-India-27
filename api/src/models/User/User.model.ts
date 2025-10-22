import { Schema, model } from "mongoose";
import commonsUtils from "../../utils";
import dao from "../../dao/User";
import { IUser, IUserMethods } from "../../interface/user.interface";

const schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    isSSO: {
      type: Boolean,
      default: false,
    },
    picture: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

commonsUtils.dbUtils.registerDaos(schema, dao);
commonsUtils.dbUtils.handleDuplicates(schema, "email");
commonsUtils.dbUtils.handleDuplicates(schema, "phone");

const userModel: IUserMethods = model<IUser, IUserMethods>("user", schema);
export default userModel;
