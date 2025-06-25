import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_URL.replace('/api', ''), {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    setSocket(newSocket);

    // Authenticate socket when user is logged in
    if (user) {
      newSocket.emit('authenticate', user._id);
    }

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [user]);

  const emitEvent = (eventName, data) => {
    if (socket) {
      socket.emit(eventName, data);
    }
  };

  const value = {
    socket,
    emitEvent,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 