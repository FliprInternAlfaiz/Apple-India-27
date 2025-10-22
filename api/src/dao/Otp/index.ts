import { IOtp, IOtpModel } from "../../interface/otp.interface";

export default {
  generateOtp: function (
    this: IOtpModel,
    { otp, userId, email }: Pick<IOtp, 'otp' | 'userId' | 'email'>
  ) {
    if (userId) {
      return this.create({ otp, userId });
    }
    if (email) {
      return this.create({ otp, email });
    }
    throw new Error("Either userId or email must be provided.");
  },

  getOtp(this: IOtpModel, { otp, userId, email }: Pick<IOtp, 'userId' | 'email' | 'otp'>) {
    const query: any = { otp };
    if (userId) {
      query.userId = userId;
    }
    if (email) {
      query.email = email;
    }
    return this.findOne(query);
  },

  deleteOtp(this: IOtpModel, { userId, email }: { userId?: string; email?: string }) {
    if (userId) {
      return this.deleteOne({ userId });
    }
    if (email) {
      return this.deleteOne({ email });
    }
    throw new Error("Either userId or email must be provided.");
  },
};
