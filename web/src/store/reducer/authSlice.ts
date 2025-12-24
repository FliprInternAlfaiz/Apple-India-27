// store/slices/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserStats {
  todayIncome: number;
  monthlyIncome: number;
  totalRevenue: number;
  totalWithdrawals: number;
  totalProfit: number;
  totalTasksCompleted: number;
  todayTasksCompleted: number;
}

interface UserData {
  id: string;
  name: string;
  phone: string;
  username: string;
  picture?: string;

  // Wallets
  mainWallet: number;
  commissionWallet: number;

  // Statistics
  todayIncome: number;
  monthlyIncome: number;
  totalRevenue: number;
  totalWithdrawals: number;
  totalProfit: number;

  // Tasks
  totalTasksCompleted: number;
  todayTasksCompleted: number;

  // Level
  userLevel: number;
  levelName: string;

  // Status
  isActive: boolean;
  isVerified: boolean;

  // Referral
  referralCode?: string;
  totalReferrals: number;

  teamLevel: string | undefined;

  currentLevel:string;

  currentLevelNumber:number;
}

interface AuthData {
  isLoggedIn: "loading" | "login" | "logout";
  userData: UserData | null;
}

export const authInitialState: AuthData = {
  isLoggedIn: "loading",
  userData: null,
};

const authSlice = createSlice({
  name: "Auth Slice",
  initialState: authInitialState,
  reducers: {
    login(state, action: PayloadAction<UserData>) {
      state.isLoggedIn = "login";
      state.userData = action.payload;
    },
    logout(state) {
      state.isLoggedIn = "logout";
      state.userData = null;
    },
    updateUserWallet(
      state,
      action: PayloadAction<{ mainWallet?: number; commissionWallet?: number }>
    ) {
      if (state.userData) {
        if (action.payload.mainWallet !== undefined) {
          state.userData.mainWallet = action.payload.mainWallet;
        }
        if (action.payload.commissionWallet !== undefined) {
          state.userData.commissionWallet = action.payload.commissionWallet;
        }
      }
    },
    updateUserStats(state, action: PayloadAction<Partial<UserStats>>) {
      if (state.userData) {
        state.userData = {
          ...state.userData,
          ...action.payload,
        };
      }
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserData>>) {
      if (state.userData) {
        state.userData = {
          ...state.userData,
          ...action.payload,
        };
      }
    },
  },
});

export const {
  login,
  logout,
  updateUserWallet,
  updateUserStats,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;
