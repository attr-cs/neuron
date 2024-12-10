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

      newSocket.on('connect', () => {
        newSocket.emit('user_connected', auth.userId);
      });

      newSocket.on('online_users_list', (users) => {
        setOnlineUsers(new Set(users));
      });

      

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

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [auth.isAuthenticated, auth.userId]);

  return (
    <SocketContext.Provider value={socket}>
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