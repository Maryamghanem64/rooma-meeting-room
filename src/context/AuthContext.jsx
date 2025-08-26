import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

// Create context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On app load, check localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRoles = localStorage.getItem("role");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        // Handle both string and array roles
        if (savedRoles) {
          try {
            const parsedRoles = JSON.parse(savedRoles);
            setRoles(Array.isArray(parsedRoles) ? parsedRoles : [parsedRoles]);
          } catch (e) {
            // If it's not valid JSON, treat as string
            setRoles([savedRoles]);
          }
        } else {
          setRoles([]);
        }
        setToken(savedToken);
      } catch (error) {
        console.error("Error parsing stored auth data:", error);
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        setUser(null);
        setRoles([]);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Use new role structure from backend (user.role)
      const role = data.user?.role || data.role || null;
      
      console.log("Login successful, saving user and token:", data.user, data.token); // Log the user and token
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", Array.isArray(role) ? JSON.stringify(role) : role);
      localStorage.setItem("token", data.token);

      setUser(data.user);
      setRoles(role ? [role] : []);
      setToken(data.token);

      return { 
        success: true, 
        user: data.user,
        roles: role ? [role] : []
      };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    localStorage.removeItem("token");
    setUser(null);
    setRoles([]);
    setToken(null);
  };

  const getUser = () => {
    return user;
  };

  const getRoles = () => {
    return roles;
  };

  const getToken = () => {
    return token;
  };

  const hasRole = (requiredRole) => {
    if (!roles || !requiredRole) return false;
    const normalizedRequired = String(requiredRole).toLowerCase();
    const normalizedRoles = Array.isArray(roles) 
      ? roles.map(r => String(r).toLowerCase())
      : [String(roles).toLowerCase()];
    return normalizedRoles.includes(normalizedRequired);
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Sending forgot password request for email:", email);
      const response = await api.post('/forgot-password', { email });
      
      console.log("Forgot password response:", response.data);
      return { 
        success: true, 
        message: response.data.message || 'Password reset email sent successfully' 
      };
    } catch (err) {
      console.error("Forgot password error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to send reset email. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, email, password, password_confirmation) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Sending reset password request with token:", token, "and email:", email);
      const response = await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: password_confirmation || password
      });
      
      console.log("Reset password response:", response.data);
      return { 
        success: true, 
        message: response.data.message || 'Password reset successfully' 
      };
    } catch (err) {
      console.error("Reset password error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      // Handle 422 validation errors specifically
      if (err.response?.status === 422 && (err.response?.data?.errors || err.response?.errors)) {
        // Extract validation error messages - check both response.data.errors and response.errors
        const validationErrors = err.response.data?.errors || err.response.errors;
        const errorMessages = [];
        
        // Flatten all validation error messages
        Object.values(validationErrors).forEach(errorArray => {
          if (Array.isArray(errorArray)) {
            errorMessages.push(...errorArray);
          } else if (typeof errorArray === 'string') {
            errorMessages.push(errorArray);
          }
        });
        
        const errorMessage = errorMessages.join(' ') || 'Password validation failed. Please check your input.';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          validationErrors: validationErrors // Include detailed errors for component handling
        };
      }
      
      // Handle other types of errors
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Failed to reset password. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Change password function for authenticated users
  const changePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Sending change password request");
      const response = await api.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation || newPassword
      });
      
      console.log("Change password response:", response.data);
      return { 
        success: true, 
        message: response.data.message || 'Password changed successfully' 
      };
    } catch (err) {
      console.error("Change password error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      // Handle 422 validation errors specifically
      if (err.response?.status === 422 && (err.response?.data?.errors || err.response?.errors)) {
        // Extract validation error messages - check both response.data.errors and response.errors
        const validationErrors = err.response.data?.errors || err.response.errors;
        const errorMessages = [];
        
        // Flatten all validation error messages
        Object.values(validationErrors).forEach(errorArray => {
          if (Array.isArray(errorArray)) {
            errorMessages.push(...errorArray);
          } else if (typeof errorArray === 'string') {
            errorMessages.push(errorArray);
          }
        });
        
        const errorMessage = errorMessages.join(' ') || 'Password validation failed. Please check your input.';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          validationErrors: validationErrors
        };
      }
      
      // Handle specific backend method errors
      if (err.response?.data?.message?.includes('hasRole') || 
          err.message?.includes('hasRole')) {
        const errorMessage = 'Backend configuration error. Please contact support.';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          backendError: true
        };
      }
      
      // Handle other types of errors
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Failed to change password. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile function - now accepts userId parameter
  const updateProfile = async (profileData, userId = null) => {
    try {
      setLoading(true);
      setError(null);

      // Determine the endpoint based on whether userId is provided
      // If userId is null, use the current user's ID
      // Handle both 'id' (lowercase) and 'Id' (uppercase) properties
      const targetUserId = userId !== null ? userId : (user ? (user.id || user.Id) : null);
      
      if (!targetUserId) {
        console.error("User object:", user);
        throw new Error("User ID is required for profile update. Please check if user is properly authenticated.");
      }
      
      const endpoint = `/users/${targetUserId}`;
      
      console.log("Sending update profile request:", profileData);
      console.log("Current token:", localStorage.getItem("token")); // Log the token
      const response = await api.put(endpoint, profileData);
      console.log("Update profile response:", response.data);
      
      // Update local user state and localStorage if updating current user
      // Check if we're updating the currently logged-in user (either no userId provided OR userId matches current user)
      if ((!userId || userId === user?.id) && user) {
        const updatedUser = response.data.user || response.data.data || { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return { 
        success: true, 
        message: response.data.message || 'Profile updated successfully',
        user: response.data.user || response.data.data
      };
    } catch (err) {
      console.error("Update profile error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      // Handle 422 validation errors specifically
      if (err.response?.status === 422 && (err.response?.data?.errors || err.response?.errors)) {
        // Extract validation error messages - check both response.data.errors and response.errors
        const validationErrors = err.response.data?.errors || err.response.errors;
        const errorMessages = [];
        
        // Flatten all validation error messages
        Object.values(validationErrors).forEach(errorArray => {
          if (Array.isArray(errorArray)) {
            errorMessages.push(...errorArray);
          } else if (typeof errorArray === 'string') {
            errorMessages.push(errorArray);
          }
        });
        
        const errorMessage = errorMessages.join(' ') || 'Profile validation failed. Please check your input.';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          validationErrors: validationErrors
        };
      }
      
      // Handle specific backend method errors
      if (err.response?.data?.message?.includes('hasRole') || 
          err.message?.includes('hasRole')) {
        const errorMessage = 'Backend configuration error. Please contact support.';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          backendError: true
        };
      }
      
      // Handle other types of errors
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Failed to update profile. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        token,
        loading,
        error,
        login,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        getUser,
        getRoles,
        getToken,
        hasRole,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
