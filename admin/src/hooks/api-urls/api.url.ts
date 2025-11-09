const authPrefix = "/auth/admin";

const userPrefix = "/admin";
const adminPrefix = "/admin";

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
};

export const adminUrls = {
  TASKS: adminPrefix + "/tasks",
  TASK_BY_ID: (taskId: string) => `${adminPrefix}/tasks/${taskId}`,
  TOGGLE_TASK_STATUS: (taskId: string) =>
    `${adminPrefix}/tasks/${taskId}/toggle-status`,
};
