import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { request, type IServerResponse } from "../lib/request";

interface IUser {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface IAuthContext {
  user: IUser | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<IServerResponse>;
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<IServerResponse>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const res = await request({ url: "/auth/login", method: "POST", data: { phone, password } });
    if (res.status === "success") {
      setUser(res.data as IUser);
      localStorage.setItem("user", JSON.stringify(res.data));
    }
    return res;
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await request({ url: "/auth/signup", method: "POST", data });
    if (res.status === "success") {
      setUser(res.data as IUser);
      localStorage.setItem("user", JSON.stringify(res.data));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
