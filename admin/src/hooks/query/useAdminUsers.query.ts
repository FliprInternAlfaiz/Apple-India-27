import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

// ==================== Types ====================

interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  verificationStatus?: string;
  userLevel?: string;
  teamLevel?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ResetPasswordPayload {
  userId: string;
  newPassword: string;
}

interface UpdateVerificationPayload {
  userId: string;
  isVerified: boolean;
}

interface UpdateAadhaarPayload {
  userId: string;
  status: "approved" | "rejected" | "pending";
  rejectionReason?: string;
}

interface UpdateStatusPayload {
  userId: string;
  isActive: boolean;
}

interface UpdateLevelPayload {
  userId: string;
  userLevel: number;
  currentLevel: string;
  levelName: string;
}

interface AddWalletAmountPayload {
  userId: string;
  walletType: "mainWallet" | "commissionWallet";
  amount: number;
}

// ==================== Fetch Queries ====================

// ✅ Get all users with filters
const fetchAllUsers = async (filters: UserFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await request({
    url: userUrls.USERS + "?" + params.toString(),
    method: "GET",
  });

  return response.data;
};

// ✅ Get single user by ID
const fetchUserById = async (userId: string) => {
  const response = await request({
    url: userUrls.USER_BY_ID(userId),
    method: "GET",
  });

  return response.data;
};

// ==================== Mutations ====================

// ✅ Reset user password
const resetUserPassword = async ({
  userId,
  newPassword,
}: ResetPasswordPayload) => {
  const response = await request({
    url: userUrls.RESET_PASSWORD(userId),
    method: "POST",
    data: { newPassword },
  });

  return response.data;
};

// ✅ Update verification status
const updateVerification = async ({
  userId,
  isVerified,
}: UpdateVerificationPayload) => {
  const response = await request({
    url: userUrls.VERIFICATION(userId),
    method: "PATCH",
    data: { isVerified },
  });

  return response.data;
};

// ✅ Update Aadhaar verification status
const updateAadhaarVerification = async ({
  userId,
  status,
  rejectionReason,
}: UpdateAadhaarPayload) => {
  const response = await request({
    url: userUrls.AADHAAR_VERIFICATION(userId),
    method: "PATCH",
    data: { status, rejectionReason },
  });

  return response.data;
};

// ✅ Toggle user active/inactive status
const toggleUserStatus = async ({ userId, isActive }: UpdateStatusPayload) => {
  const response = await request({
    url: userUrls.STATUS(userId),
    method: "PATCH",
    data: { isActive },
  });

  return response.data;
};

// ✅ Update user level / promotion
const updateUserLevel = async ({
  userId,
  userLevel,
  currentLevel,
  levelName,
}: UpdateLevelPayload) => {
  const response = await request({
    url: userUrls.LEVEL(userId),
    method: "PATCH",
    data: { userLevel, currentLevel, levelName },
  });

  return response.data;
};

const addWalletAmount = async ({
  userId,
  walletType,
  amount,
}: AddWalletAmountPayload) => {
  const response = await request({
    url: userUrls.ADD_WALLET_AMOUNT(userId),
    method: "POST",
    data: { walletType, amount },
  });

  return response.data;
};

// ==================== React Query Hooks ====================

// ✅ Fetch All Users
export const useAllUsers = (filters: UserFilters) =>
  useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => fetchAllUsers(filters),
    staleTime: 30 * 1000, // 30s
  });

// ✅ Fetch Single User
export const useUserById = (userId: string) =>
  useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

// ✅ Reset Password Mutation
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetUserPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

// ✅ Update Verification Mutation
export const useUpdateVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

// ✅ Update Aadhaar Mutation
export const useUpdateAadhaar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAadhaarVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

// ✅ Toggle User Status Mutation
export const useToggleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

// ✅ Update User Level Mutation
export const useUpdateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useAddWalletAmount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWalletAmount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};
