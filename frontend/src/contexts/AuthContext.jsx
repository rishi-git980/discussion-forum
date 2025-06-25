import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const validateToken = (token) => {
    if (!token) {
      console.log('validateToken: Token is null or undefined.');
      return false;
    }
    try {
      console.log('validateToken: Attempting to parse token payload.');
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('validateToken: Token expiration (exp) ', tokenPayload.exp, ', Current time: ', currentTime);
      return tokenPayload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('AuthContext useEffect: Initializing authentication.');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && validateToken(storedToken)) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        console.log('AuthContext useEffect: User and token successfully loaded from localStorage.');
      } catch (error) {
        console.error('Error parsing stored user data in useEffect:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    } else {
      console.log('AuthContext useEffect: No valid token or user in localStorage. Clearing.');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
    setLoading(false);
    console.log('AuthContext useEffect: Authentication initialization complete. Loading set to false.');
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.token) {
        console.log('Login: Token received from server:', response.data.token);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Login: Token and user stored in localStorage.');
        setUser(response.data.user);
        setToken(response.data.token);
        return response.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
      });
      
      if (response.data.token) {
        console.log('Register: Token received from server:', response.data.token);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Register: Token and user stored in localStorage.');
        setUser(response.data.user);
        return response.data;
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    console.log('Logout: Clearing user and token from localStorage.');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      if (!prev) return prev;

      const newUser = typeof updates === 'function' 
        ? updates(prev)
        : { ...prev, ...updates };

      // Ensure we're not storing undefined values
      Object.keys(newUser).forEach(key => {
        if (newUser[key] === undefined) {
          delete newUser[key];
        }
      });

      // Update localStorage with the complete user object
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser;
    });
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 