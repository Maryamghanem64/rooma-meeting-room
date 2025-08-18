import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api"; // axios instance with baseURL + token

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setError("Failed to check authentication status");
    } finally {
      setLoading(false);
    }
  };

  // Login function (calls Laravel API)
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;

      // Save user + token to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError("Login failed. Please check your credentials.");
      return { success: false, error: "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // Logout function (calls Laravel API)
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setError(null);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put("/user/profile", userData);
      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Profile update error:", error.response?.data || error.message);
      setError("Failed to update profile");
      return { success: false, error: "Profile update failed" };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.some((r) => r.name === role);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
