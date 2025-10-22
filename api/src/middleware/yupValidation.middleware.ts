import { NextFunction, Request, Response } from "express";
import { AnyObject, ObjectSchema, ValidationError } from "yup";
import { JsonResponse } from "../utils/jsonResponse";

export const yupValidationMiddleware = <T extends AnyObject>(
  schema: ObjectSchema<T>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      return next();
    } catch (err) {
      const validationError = err as ValidationError;

      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        title: "Validation Error",
        message: validationError.errors.join(", "),
      });
    }
  };
};
