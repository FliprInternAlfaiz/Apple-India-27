import { asyncWrapper } from "./asyncWrapper.utils";
import dbUtils from "./db.utils";
import { generateFileUrl } from "./generateFileUrl.utils";
import { JsonResponse } from "./jsonResponse";
import encryptPassword from "./encryptPassword";
import otp from "./otp";

const commonsUtils = {
  asyncWrapper,
  JsonResponse,
  dbUtils,
  generateFileUrl,
  encryptPassword,
  otp,
};

export default commonsUtils;