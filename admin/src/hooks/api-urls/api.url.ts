const authPrefix = "/auth/admin";

const userPrefix = "/admin";

const adminPrefix = "/admin";

const LevelPrefix = "/level/admin";

const teamPrefix = "/team/admin";

const paymentPrefix = "/payment/admin";

const rechargePrefix = "/recharge/admin";

const conferenceNews = "/conferenceNews";

const withdrawalPrefix = "/withdrawal/admin";

export const authUrls = {
  LOGIN: authPrefix + "/login",
  PROFILE: authPrefix + "/profile",
  LOGOUT: authPrefix + "/logout",
};

export const userUrls = {
  USERS: userPrefix + "/users",
  USER_BY_ID: (userId: string) => userPrefix + "/users/" + userId,
  RESET_PASSWORD: (userId: string) =>
    userPrefix + "/users/" + userId + "/reset-password",
  VERIFICATION: (userId: string) =>
    userPrefix + "/users/" + userId + "/verification",
  AADHAAR_VERIFICATION: (userId: string) =>
    userPrefix + "/users/" + userId + "/aadhaar-verification",
  STATUS: (userId: string) => userPrefix + "/users/" + userId + "/status",
  LEVEL: (userId: string) => userPrefix + "/users/" + userId + "/level",
  ADD_WALLET_AMOUNT: (userId: string) =>
    userPrefix + "/users/" + userId + "/add-wallet-amount",
  DEDUCT_WALLET_AMOUNT : (userId:string) => 
    userPrefix + "/users/" + userId + "/deduct-wallet-amount",
};

export const adminUrls = {
  TASKS: adminPrefix + "/tasks",
  TASK_BY_ID: (taskId: string) => `${adminPrefix}/tasks/${taskId}`,
  TOGGLE_TASK_STATUS: (taskId: string) =>
    `${adminPrefix}/tasks/${taskId}/toggle-status`,

  LEVELS: `${LevelPrefix}/levels`,
  LEVEL_BY_ID: (levelId: string) => `${LevelPrefix}/levels/${levelId}`,

  TEAM_REFERRALS: `${teamPrefix}/team/referrals`,
  TEAM_STATISTICS: `${teamPrefix}/team/statistics`,
  TEAM_TREE_BY_USER: (userId: string) => `${teamPrefix}/team/tree/${userId}`,
};

export const paymentUrls = {
  PAYMENT_METHODS: paymentPrefix + "/payment-methods",
  PAYMENT_METHOD_BY_ID: (methodId: string) =>
    `${paymentPrefix}/payment-methods/${methodId}`,
};

export const rechargeUrls = {
  RECHARGES: rechargePrefix + "/recharges",
  RECHARGE_STATISTICS: rechargePrefix + "/recharges/statistics",
  APPROVE_RECHARGE: (orderId: string) =>
    `${rechargePrefix}/recharges/approve/${orderId}`,
  REJECT_RECHARGE: (orderId: string) =>
    `${rechargePrefix}/recharges/reject/${orderId}`,
};

export const withdrawalUrls = {
  WITHDRAWALS: withdrawalPrefix + "/withdrawals",
  WITHDRAWAL_STATISTICS: withdrawalPrefix + "/withdrawals/statistics",
  APPROVE_WITHDRAWAL: (withdrawalId: string) =>
    `${withdrawalPrefix}/withdrawals/approve/${withdrawalId}`,
  REJECT_WITHDRAWAL: (withdrawalId: string) =>
    `${withdrawalPrefix}/withdrawals/reject/${withdrawalId}`,

  WITHDRAWAL_CONFIGS: "/withdrawalConfig/withdrawal-configs",
  UPDATE_WITHDRAWAL_CONFIG: (dayOfWeek: number) =>
    `//withdrawalConfig/withdrawal-configs/${dayOfWeek}`,
  BULK_UPDATE_CONFIGS: "/withdrawalConfig/withdrawal-configs/bulk",
};

export const conferenceNewsUrls = {
  ACTIVE: conferenceNews + "/active",
  ALL: conferenceNews + "/all",
  CREATE: conferenceNews + "/create",
  UPLOAD_IMAGE: conferenceNews + "/upload-image",
  CLOSE: conferenceNews + "/close",
  DELETE: conferenceNews + "/delete",
  TOGGLE_STATUS: conferenceNews + "/toggle-status",
};
