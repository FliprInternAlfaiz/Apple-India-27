import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import CONSTANTS from '../../constants/CONSTANTS';
import models from '../../models';
import { adminDao } from '../../dao/admin';
import { JsonResponse } from '../../utils/jsonResponse';
import { jwtConfig } from '../../services';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return JsonResponse(res, {
        message: 'All fields are necessary',
        status: 'error',
        statusCode: 400,
        title: 'Please provide all fields',
      });
    }
    const adminDetails = await adminDao.findByEmail(email);
    if (!adminDetails) {
      return JsonResponse(res, {
        message: 'Admin not found',
        status: 'error',
        statusCode: 400,
        title: 'Details not found',
      });
    }
    const passwordVerified = bcrypt.compareSync(
      password,
      adminDetails.password,
    );
    if (!passwordVerified) {
      return JsonResponse(res, {
        statusCode: 400,
        status: 'error',
        title: 'Error',
        message: 'Please enter valid credentials',
      });
    }

    const token = jwtConfig.jwtService.generateJWT({
      email: adminDetails.email,
      id: adminDetails.id,
    });

    const authToken = await models.token.createToken({
      userId: new ObjectId(adminDetails.id as string),
      token: token,
    });

    res.cookie(CONSTANTS.adminTokenKey, authToken.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    const { password: _, ...adminData } = adminDetails.toObject();
    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Login Successfull',
      message: 'Admin login successful',
      data: adminData,
    });
  } catch (error) {
    return JsonResponse(res, {
      message: 'Internal server error',
      status: 'error',
      statusCode: 500,
      title: 'Something went wrong',
    });
  }
};




