const authPrefix = "/auth/user";

const taskPrefix = "/task";

const withdrawalPrefix = "/withdrawal";

const rechargePrefix = "/recharge"

const levelPrefix = "/level";

const teamPrefix = "/team";

const verificationPrefix = "/verification";


const conferenceNews = "/conferenceNews";

const luckydrawPrefix = "/luckydraw"
  
export const authUrls = {
  LOGIN: authPrefix + "/login",
  SIGNUP: authPrefix + "/signup",
  VERIFYUSER:authPrefix + "/profile",
  LOGOUT:authPrefix + "/logout"
};

export const teamUrls = {
  TEAM_STATS: teamPrefix + "/stats",
  REFERRAL_LINK: teamPrefix + "/referral-link",
  TEAM_MEMBERS: (level: string) => `${teamPrefix}/members/${level}`,
  REFERRAL_HISTORY : teamPrefix + "/referral-history",
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
   CHECK_AVAILABILITY: withdrawalPrefix + "/check-availability",
  WITHDRAWAL_SCHEDULE: withdrawalPrefix + "/schedule",
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


export const verificationUrls = {
  VERIFICATION_STATUS: verificationPrefix + "/status",
  UPLOAD_AADHAAR: verificationPrefix + "/upload-aadhaar",
  UPLOAD_FILE: verificationPrefix + "/upload-photo",
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


export const luckyDrawUrls = {
  ACTIVE: luckydrawPrefix + "/active",
  DETAILS: luckydrawPrefix + "/details/:drawId",
  PARTICIPATE: luckydrawPrefix + "/participate",
  UPLOAD_IMAGE: luckydrawPrefix + "/admin/upload-image",
  CREATE: luckydrawPrefix + "/admin/create",
  ALL: luckydrawPrefix + "/admin/all",
  DELETE: luckydrawPrefix + "/admin/delete/:drawId",
  TOGGLE_STATUS: luckydrawPrefix + "/admin/toggle-status/:drawId",
  SELECT_WINNERS: luckydrawPrefix + "/admin/select-winners/:drawId",
  ADMIN_DETAILS: luckydrawPrefix + "/admin/details/:drawId",
};

