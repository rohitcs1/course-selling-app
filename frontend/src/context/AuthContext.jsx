import React, { useState, useEffect, useCallback } from "react";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setAdminToken(savedToken);
    }
    setIsInitialized(true);
  }, []);

  const login = useCallback((token) => {
    setAdminToken(token);
    localStorage.setItem("admin_token", token);
  }, []);

  const logout = useCallback(() => {
    setAdminToken(null);
    localStorage.removeItem("admin_token");
  }, []);

  return (
    <AuthContext.Provider value={{ adminToken, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AuthProvider");
  }
  return context;
}
