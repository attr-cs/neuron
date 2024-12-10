const emitMessage = (socket, { roomId, message, sender }) => {
  if (!socket) return;
  socket.emit('send_message', {
    roomId,
    content: message,
    sender
  });
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