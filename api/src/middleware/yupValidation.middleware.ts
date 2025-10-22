import { NextFunction, Request, Response } from 'express';
import { AnyObject, ObjectSchema, ValidationError } from 'yup';
import { JsonResponse } from '../utils/jsonResponse';


export default <T extends AnyObject>(schema: ObjectSchema<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      return next();
    } catch (error) {
      const validationError = error as ValidationError;
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        title: 'Validation error',
        message: validationError.errors[0],
      });
    }
  };
};
