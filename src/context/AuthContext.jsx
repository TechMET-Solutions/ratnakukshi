import React, { createContext, useState, useContext, useEffect } from "react";
import { API } from "../api/BaseURL";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password, role }) => {
    const response = await fetch(`${API}/api/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Login failed");
    }

    const payload = data?.data || {};
    const normalizedUser = {
      id: payload?.id || null,
      name: payload?.name || "",
      role: String(payload?.role || role || "").toLowerCase(),
      email: payload?.email || email,
      mobile: payload?.mobile || "",
      profilePhoto: payload?.profile_photo || payload?.profilePhoto || null,
    };

    setUser(normalizedUser);
    sessionStorage.setItem("user", JSON.stringify(normalizedUser));
    // sessionStorage.setItem("role", normalizedUser.role || "");
    sessionStorage.setItem("token", data?.token);

    return normalizedUser;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    // sessionStorage.removeItem("role");
    sessionStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
