import React, { createContext, useState, useContext, useEffect } from "react";
import { API } from "../api/BaseURL";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
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
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("role", normalizedUser.role || "");
    localStorage.setItem("token", data?.token || String(normalizedUser.id || email));

    return normalizedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
