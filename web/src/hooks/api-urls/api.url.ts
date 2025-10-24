const authPrefix = "/auth/user";

const taskPrefix = "/task";

export const authUrls = {
  LOGIN: authPrefix + "/login",
  VERIFYSIGNUPOTP: authPrefix + "/otp/verify",
  SIGNUP: authPrefix + "/signup",
  VERIFYUSER:authPrefix + "/profile"
};

export const taskUrls = {
  CREATE_TASK: taskPrefix + "/create-task",
  GET_USER_TASKS: taskPrefix + "/get-task",
};
