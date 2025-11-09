import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { adminDao } from '../../dao/admin';

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if ( !email || !password) {
      return JsonResponse(res, {
        message: 'All fields are required',
        status: 'error',
        statusCode: 400,
        title: 'Missing Fields',
      });
    }

    const existingAdmin = await adminDao.findByEmail(email);
    if (existingAdmin) {
      return JsonResponse(res, {
        message: 'Admin already exists with this email',
        status: 'error',
        statusCode: 400,
        title: 'Duplicate Entry',
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await adminDao.create({
      email,
      password: hashedPassword,
    });

    const { password: _, ...adminData } = newAdmin.toObject?.() || newAdmin;

    return JsonResponse(res, {
      message: 'Admin created successfully',
      status: 'success',
      statusCode: 201,
      title: 'Admin Created',
      data: adminData,
    });
  } catch (error) {
    return JsonResponse(res, {
      message: 'Internal server error',
      status: 'error',
      statusCode: 500,
      title: 'Error Creating Admin',
    });
  }
};