import { Response } from 'express';
import { IJsonResponse } from '../interface/jsonResponse.interface';


export const JsonResponse = (res: Response, body: IJsonResponse) => {
  res.status(body.statusCode);
  res.send({
    statusCode: body.statusCode,
    status: body.status,
    title: body.title,
    message: body.message,
    data: body.data,
    pageData: body.pageData,
    extraData: body.extraData,
  });
};
