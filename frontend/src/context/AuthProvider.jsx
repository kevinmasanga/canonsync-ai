// context/AuthProvider.jsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./AuthContext";
import { authApi } from "@/lib/api/AuthApi";

export default function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on first load
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("canonsync_token") : null;
    if (stored) {
      setToken(stored);
      authApi
        .getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("canonsync_token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { token: newToken, user: loggedInUser } = await authApi.login({ email, password });
    localStorage.setItem("canonsync_token", newToken);
    setToken(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { token: newToken, user: newUser } = await authApi.register(payload);
    localStorage.setItem("canonsync_token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}