import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../utils';

// Create context
const AuthContext = createContext(null);

// Custom hook for using AuthContext safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // example: { email, role, userType }

  // Checks session status with backend on page load/refresh
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/api/me`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          // Ensure userType/role is set from backend response for persistence
          setUser({ ...data.user, userType: data.userType || data.user.role });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      }
      // Don't change auth for other errors
    } catch (error) {
      // No state change for network errors (avoids unwanted logout on network blips)
      console.error('AuthContext: Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login handler: sets user role/state
  const login = async (email, password, role) => {
    try {
      const endpoint =
        role === 'alumni' ? '/alumni/alumniLogin' : '/admin/adminlogin';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      console.log(response);
      
      if (response.ok) {
        const data = await response.json();
        if (data?.success) {
          // First set basic auth state
          setIsAuthenticated(true);
          setUser({ email, role, userType: role });
          
          // Then refresh to get full user data from backend
          setTimeout(() => {
            checkAuthStatus();
          }, 100);
          
          return { success: true };
        }
        return { success: false, message: data?.message || 'Login failed' };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  // Convenience login helpers
  const loginAdmin = (email, password) => login(email, password, 'admin');
  const loginAlumni = (email, password) => login(email, password, 'alumni');

  // Logout handler by role
  const logout = async (role = 'any') => {
    try {
      // Immediately clear local state for instant UI response
      setIsAuthenticated(false);
      setUser(null);
      
      const endpoint =
        role === 'admin'
          ? '/admin/adminLogout'
          : role === 'alumni'
          ? '/alumni/alumniLogout'
          : '/logout';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      // Always clear state regardless of backend response
      // (handles cases where backend logout fails but we still want to clear frontend)
      setIsAuthenticated(false);
      setUser(null);
      
      // Verify logout by checking auth status
      setTimeout(() => {
        checkAuthStatus();
      }, 100);
      
      if (response.ok) {
        return { success: true };
      }
      return { success: false, message: 'Logout failed' };
    } catch (error) {
      // Even on error, clear local state
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, message: 'Network error' };
    }
  };

  // Directly set authentication state from anywhere (rare but handy)
  const setAuthState = (authenticated, userData = null) => {
    setIsAuthenticated(authenticated);
    setUser(userData);
  };

  // Run session check on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const isAdmin = user?.roles?.includes('admin') || user?.role === 'admin';
  const isAlumni = user?.roles?.includes('alumni') || user?.role === 'alumni';

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    isAdmin,
    isAlumni,
    login,
    loginAdmin,
    loginAlumni,
    logout,
    checkAuthStatus,
    refresh: checkAuthStatus,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
