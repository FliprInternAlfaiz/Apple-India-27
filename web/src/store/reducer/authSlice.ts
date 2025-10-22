import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthData {
  isLoggedIn: "loading" | "login" | "logout";
  userData: {
    id: string;
    email: string;
    // emailVerified: boolean;
    // mobile: string;
    name: string;
    role: string;
  };
}

export const authInitialState: AuthData = {
  isLoggedIn: "loading",
  userData: {
    id: "",
    email: "",
    // emailVerified: false,
    // mobile: "",
    name: "",
    role: "",
    // profileImg: "",
  },
};

const authSlice = createSlice({
  name: "Auth Slice",
  initialState: authInitialState,
  reducers: {
    login(state, action: PayloadAction<AuthData["userData"]>) {
      state.isLoggedIn = "login";
      state.userData = action.payload;
    },
    logout(state) {
      state.isLoggedIn = "logout";
      state.userData = authInitialState.userData;
    },
  },
});
export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
