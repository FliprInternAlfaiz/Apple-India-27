import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import commonsUtils from "../../utils";
import models from "../../models";
import { jwtConfig } from "../../services";
import CONSTANTS from "../../constants/CONSTANTS";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, __: NextFunction) => {
  const { phone, password } = req.body;

  const user = await models.User.findOne({ phone });

  if (!user) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 401,
      message: "No account found with this phone number.",
      title: "User Authentication",
    });
  }

  if (user.isSSO) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 401,
      message: "This account uses SSO.",
      title: "User Authentication",
    });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      message: "Invalid password.",
      title: "User Authentication",
    });
  }

  user.lastActiveDate = new Date();
  await user.save();

  const token = jwtConfig.jwtService.generateJWT({
    phone: user.phone,
    id: user.id!,
  });

  const authToken = await models.token.createToken({
    userId: new ObjectId(user.id as string),
    token,
  });

  res.cookie(CONSTANTS.userTokenKey, authToken.token, {
    httpOnly: true,
    sameSite: "none",
     secure: true,
  });

  const { password: _, ...userData } = user.toObject();

  return JsonResponse(res, {
    status: "success",
    statusCode: 200,
    title: "User Authentication",
    message: "User login successful.",
    data: userData,
  });
};
