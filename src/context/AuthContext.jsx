import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  // State for user authentication
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
      // Get user data from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call - replace with actual API endpoint
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });

      // For guest access, simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data - replace with actual API response
      const userData = {
        id: 1,
        email: email,
        name: 'User',
        role: 'user',
        avatar: null,
        department: 'Engineering',
        permissions: ['view_meetings', 'create_meetings', 'edit_minutes']
      };

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.');
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Simulate API call to logout
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear user data from localStorage
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call to update profile
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });

      // Update local user data
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Failed to update profile');
      return { success: false, error: 'Profile update failed' };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    hasPermission,
    isAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
