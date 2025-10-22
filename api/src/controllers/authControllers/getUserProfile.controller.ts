// routes/auth/verify.ts
import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import { jwtConfig } from "../../services";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.userAuth;
    if (!token) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "No token provided",
      });
    }

    const decoded = jwtConfig.jwtService.verifyJWT(token);
    if (!decoded?.id) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "Invalid token",
      });
    }

    const user = await models.User.findById(decoded.id).select("-password");
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        title: "Not Found",
        message: "User not found",
      });
    }

    res.locals.userId = user._id;

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "User Authenticated",
      message: "User is authenticated",
      data: user,
    });
  } catch (err) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to verify user"
    });
  }
};
