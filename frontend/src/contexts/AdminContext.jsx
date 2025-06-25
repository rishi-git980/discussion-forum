import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminContext = createContext();

export function useAdmin() {
  return useContext(AdminContext);
}

export const AdminProvider = ({ children }) => {
  const { token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all users with pagination and search
  const getUsers = async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        console.error('AdminContext: No token available for getUsers.');
        setError('Authentication token not found.');
        setLoading(false);
        throw new Error('Not authorized, no token');
      }
      console.log('AdminContext: Using token for getUsers:', token.substring(0, 10) + '...');

      const response = await fetch(
        `${API_URL}/admin/users?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toggle user ban status
  const toggleUserBan = async (userId, isBanned, banReason = '', banExpiresAt = null) => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        console.error('AdminContext: No token available for toggleUserBan.');
        setError('Authentication token not found.');
        setLoading(false);
        throw new Error('Not authorized, no token');
      }
      console.log('AdminContext: Using token for toggleUserBan:', token.substring(0, 10) + '...');

      const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isBanned, banReason, banExpiresAt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user ban status');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get all posts with pagination
  const getPosts = async (page = 1, limit = 10, userId = null) => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        console.error('AdminContext: No token available for getPosts.');
        setError('Authentication token not found.');
        setLoading(false);
        throw new Error('Not authorized, no token');
      }
      console.log('AdminContext: Using token for getPosts:', token.substring(0, 10) + '...');

      let url = `${API_URL}/admin/posts?page=${page}&limit=${limit}`;
      if (userId) {
        url += `&userId=${userId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const deletePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        console.error('AdminContext: No token available for deletePost.');
        setError('Authentication token not found.');
        setLoading(false);
        throw new Error('Not authorized, no token');
      }
      console.log('AdminContext: Using token for deletePost:', token.substring(0, 10) + '...');

      const response = await fetch(`${API_URL}/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete post');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    getUsers,
    toggleUserBan,
    getPosts,
    deletePost
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 