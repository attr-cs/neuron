import { memo } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';

const OnlineStatus = memo(({ userId, className }) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.has(userId);

  return isOnline ? (
    <div 
      className={cn(
        "absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background",
        "after:content-[''] after:absolute after:w-full after:h-full after:bg-green-500/50",
        "after:rounded-full after:animate-ping",
        className
      )}
    />
  ) : null;
});

export default OnlineStatus; 