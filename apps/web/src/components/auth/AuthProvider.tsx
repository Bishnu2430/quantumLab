"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { type User, fetchCurrentUser, signOut as apiSignOut } from "@/lib/api/auth";

interface AuthContextValue {
  user: User | null;
  /** True until the first `/auth/me` call settles. */
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Tracks the signed-in user.
 *
 * The session itself lives in httpOnly cookies that JavaScript cannot read, so
 * the only way to know who is signed in is to ask the API. That happens once
 * on mount and again after any sign-in or sign-out.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setUser(await fetchCurrentUser());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await apiSignOut();
    } finally {
      // Clear locally even if the request failed, so the UI never claims a
      // session the user believes they ended.
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return context;
}
