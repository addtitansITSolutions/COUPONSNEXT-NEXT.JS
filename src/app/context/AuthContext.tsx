"use client";

import { createContext, useContext, useEffect, useState, type ReactNode, } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
  email: string,
  password: string
  ) => Promise<{
    success: boolean;
    message?: string;
    details?: Record<string, string[]>;
    user?: AuthUser;
  }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext< AuthContextType | undefined >(undefined);

export function AuthProvider({ children, }: { children: ReactNode; }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetch(
        "/api/auth/me",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async ( email: string, password: string ) => {
    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            data.message || "Unable to log in. Please try again.",
          details: data.details,
        };
      }

      if (data.success && data.user) {
        setUser(data.user);

        return {
          success: true,
          user: data.user,
        };
      }

      return {
        success: false,
        message: "Unable to log in. Please try again.",
      };
    } catch {
      return {
        success: false,
        message: "Something went wrong. Please check your connection and try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,       //as user is an object but isAuthenticated is a boolean, we can use !!user to convert the user object to a boolean value. If user is not null, !!user will be true, indicating that the user is authenticated. If user is null, !!user will be false, indicating that the user is not authenticated.
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}