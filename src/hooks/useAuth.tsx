import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../data/types";
import { DEMO_USERS } from "../data/mock-data";

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  switchUser: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("lupao-current-user");
      if (saved) return JSON.parse(saved);
      // Default to Maria Cruz (System Administrator) for quick initial load if not set
      return DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("lupao-current-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("lupao-current-user");
    }
  }, [user]);

  const login = (username: string, _pass: string): boolean => {
    const found = DEMO_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const switchUser = (username: string) => {
    const found = DEMO_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setUser(found);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
