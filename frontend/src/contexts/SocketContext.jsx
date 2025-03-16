import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useRecoilState, useRecoilValue } from 'recoil';
import { authState, onlineUsersState } from '@/store/atoms';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const auth = useRecoilValue(authState);
  const [onlineUsers, setOnlineUsers] = useRecoilState(onlineUsersState);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL.replace('/api', ''), {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        withCredentials: true
      });

      // Connect and emit online status
      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('user_connected', auth.userId);
      });

      // Handle online users updates
      newSocket.on('online_users_list', (users) => {
        console.log('Online users updated:', users);
        setOnlineUsers(new Set(users));
      });

      // Handle individual user status changes
      newSocket.on('user_status_change', ({ userId, status }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === 'online') {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      // Handle disconnection
      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      // Cleanup on unmount or auth change
      return () => {
        if (newSocket) {
          newSocket.emit('user_disconnected', auth.userId);
          newSocket.disconnect();
        }
      };
    }
  }, [auth.isAuthenticated, auth.userId]);

  // Handle window close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && auth.userId) {
        socket.emit('user_disconnected', auth.userId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [socket, auth.userId]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 