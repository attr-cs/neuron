import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

const messageCache = new Map();
const MESSAGE_CACHE_SIZE = 100;

const emitMessage = async (socket, { roomId, message, sender }) => {
  if (!socket) return;

  // Add message to cache
  const cacheKey = `${roomId}-${Date.now()}`;
  messageCache.set(cacheKey, { roomId, content: message, sender, timestamp: Date.now() });
  
  // Maintain cache size
  if (messageCache.size > MESSAGE_CACHE_SIZE) {
    const oldestKey = messageCache.keys().next().value;
    messageCache.delete(oldestKey);
  }

  try {
    await socket.emit('send_message', {
      roomId,
      content: message,
      sender
    });

    // Update query cache
    queryClient.setQueryData(['messages', roomId], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map(page => [...page]),
        pageParams: [...old.pageParams]
      };
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

const joinRoom = (socket, roomId) => {
  if (!socket) return;
  socket.emit('join_room', roomId);
};

const emitTyping = (socket, { roomId, userId, isTyping }) => {
  if (!socket) return;
  socket.emit(isTyping ? 'typing_start' : 'typing_end', {
    roomId,
    userId
  });
};

const getUserStatus = (socket, userId) => {
  if (!socket) return;
  socket.emit('get_user_status', userId);
};

const socketService = {
  emitMessage,
  joinRoom,
  emitTyping,
  getUserStatus
};

export default socketService; 