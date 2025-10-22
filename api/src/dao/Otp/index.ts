import { IOtp, IOtpModel } from "../../interface/otp.interface";

export default {
  async generateOtp(
    this: IOtpModel,
    { otp, userId, email, phone }: Pick<IOtp, "otp" | "userId" | "email" | "phone">
  ) {
    if (!userId && !email && !phone) {
      throw new Error("Either userId, email, or phone must be provided.");
    }

    await this.deleteMany({ $or: [{ userId }, { email }, { phone }] });

    return this.create({ otp, userId, email, phone });
  },

  async getOtp(
    this: IOtpModel,
    { otp, userId, email, phone }: Pick<IOtp, "otp" | "userId" | "email" | "phone">
  ) {
    if (!otp) throw new Error("OTP is required.");

    return this.findOne({
      otp,
      $or: [{ userId }, { email }, { phone }],
    });
  },

  async deleteOtp(
    this: IOtpModel,
    { userId, email, phone }: { userId?: string; email?: string; phone?: string }
  ) {
    if (!userId && !email && !phone) {
      throw new Error("Either userId, email, or phone must be provided.");
    }

    return this.deleteMany({
      $or: [{ userId }, { email }, { phone }],
    });
  },
};
