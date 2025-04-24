import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('userToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify token is valid by getting user profile
          const response = await authService.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Error loading user:', error);
          // Clear invalid token/user
          localStorage.removeItem('userToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      const { token, ...user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('userToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      const { token, ...user } = response.data;
      
      console.log('Login response:', response.data);
      console.log('Is admin from backend:', response.data.isAdmin);
      
      // Store token and user in localStorage
      localStorage.setItem('userToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAdmin: user?.isAdmin || false,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 