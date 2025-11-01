import { IOtp, IOtpModel } from "../../interface/otp.interface";

export default {
  async generateOtp(
    this: IOtpModel,
    { otp, userId, phone }: Pick<IOtp, "otp" | "userId" | "phone">
  ) {
    if (!userId && !phone) {
      throw new Error("Either userId or phone must be provided.");
    }

    await this.deleteMany({ $or: [{ userId }, { phone }] });

    return this.create({ otp, userId, phone });
  },

  async getOtp(
    this: IOtpModel,
    { otp, userId, phone }: Pick<IOtp, "otp" | "userId" | "phone">
  ) {
    if (!otp) throw new Error("OTP is required.");

    return this.findOne({
      otp,
      $or: [{ userId }, { phone }],
    });
  },

  async deleteOtp(
    this: IOtpModel,
    { userId, phone }: { userId?: string; phone?: string }
  ) {
    if (!userId && !phone) {
      throw new Error("Either userId or phone must be provided.");
    }

    return this.deleteMany({
      $or: [{ userId }, { phone }],
    });
  },
};
