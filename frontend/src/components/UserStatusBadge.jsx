import { Badge } from "@/components/ui/badge";
import { useSocket } from '@/contexts/SocketContext';
import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms';

export default function UserStatusBadge({ userId }) {
  const socket = useSocket();
  const auth = useRecoilValue(authState);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (userId === auth.userId) {
        setIsOnline(true);
        return;
      }

    if (!socket || !userId) return;
    
    const handleStatusChange = ({ userId: changedUserId, status }) => {
      if (changedUserId === userId) {
        setIsOnline(status === 'online');
      }
    };

    socket.on('user_status_change', handleStatusChange);
    socket.emit('get_user_status', userId);

    return () => {
      socket.off('user_status_change', handleStatusChange);
    };
  }, [socket, userId]);

  return (
    <Badge 
      variant={isOnline ? "success" : "secondary"}
      className="ml-2 text-xs"
    >
      {isOnline ? "Online" : "Offline"}
    </Badge>
  );
} 