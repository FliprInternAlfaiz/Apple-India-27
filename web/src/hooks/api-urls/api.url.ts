const authPrefix = "/auth/user";

const taskPrefix = "/task";

const withdrawalPrefix = "/withdrawal";

const rechargePrefix = "/recharge"

const levelPrefix = "/level";
  

export const authUrls = {
  LOGIN: authPrefix + "/login",
  VERIFYSIGNUPOTP: authPrefix + "/otp/verify",
  SIGNUP: authPrefix + "/signup",
  VERIFYUSER:authPrefix + "/profile"
};

export const taskUrls = {
  CREATE_TASK: taskPrefix + "/create-task",
  GET_USER_TASKS: taskPrefix + "/get-task",
  COMPLETE_TASK: taskPrefix + "/complete-tasks",
  GET_TASK_BY_ID: taskPrefix + "/get-single-tasks",
};


export const withdrawalUrls = {
  WALLET_INFO: withdrawalPrefix + "/wallet-info",
  BANK_ACCOUNTS: withdrawalPrefix + "/bank-accounts",
  CREATE_WITHDRAWAL: withdrawalPrefix + "/create",
  WITHDRAWAL_HISTORY: withdrawalPrefix + "/history",
  SET_PASSWORD: withdrawalPrefix + "/set-password",
};

export const rechargeUrls = {
  WALLET_INFO: rechargePrefix + "/wallet-info",
  PAYMENT_METHODS: rechargePrefix +  "/payment-methods",
  CREATE_ORDER: rechargePrefix + "/create-order",
  VERIFY_PAYMENT: rechargePrefix + "/verify-payment",
  HISTORY: rechargePrefix + "/history",
  GENERATE_QR : rechargePrefix + "/generate-qr",
  APPROVE: (orderId: string) => rechargePrefix + `/admin/approve/${orderId}`,
  REJECT: (orderId: string) => rechargePrefix + `/admin/reject/${orderId}`,
};

export const levelUrls = {
  GET_ALL: levelPrefix + "/get",
  GET_BY_NAME: (levelName: string) => levelPrefix + `/name/${levelName}`,
  GET_BY_NUMBER: (levelNumber: number) => levelPrefix + `/number/${levelNumber}`,
  UPGRADE_USER: levelPrefix + "/upgrade",
  CREATE_LEVEL: levelPrefix + "/create",
  UPDATE_LEVEL: (levelId: string) => levelPrefix + `/update/${levelId}`,
};