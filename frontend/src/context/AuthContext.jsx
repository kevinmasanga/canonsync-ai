// context/AuthContext.jsx

"use client";

import { createContext, useContext } from "react";

// Shape: { user, token, isAuthenticated, isLoading, login, register, logout }
export const AuthContext = createContext(null);

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}