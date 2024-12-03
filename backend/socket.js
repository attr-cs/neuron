const { Server } = require('socket.io');
const { Message } = require('./models/messageModel');
const { User } = require('./models/userModel');
const mongoose = require('mongoose');

function initializeSocket(server) {
  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('user_connected', (userId) => {
      console.log('User connected with ID:', userId);
      onlineUsers.set(userId, socket.id);
      
      // Broadcast to all clients that this user is online
      io.emit('user_status_change', { userId, status: 'online' });
      
      // Send current online users list to the newly connected user
      const onlineUsersList = Array.from(onlineUsers.keys());
      socket.emit('online_users_list', onlineUsersList);
    });

    socket.on('get_user_status', (userId) => {
      const isOnline = onlineUsers.has(userId);
      socket.emit('user_status_change', { 
        userId, 
        status: isOnline ? 'online' : 'offline' 
      });
    });

    socket.on('disconnect', () => {
      let disconnectedUserId;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        // Broadcast to all clients that this user is offline
        io.emit('user_status_change', { 
          userId: disconnectedUserId, 
          status: 'offline' 
        });
      }
    });

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('send_message', async (data) => {
      try {
        if (!data.content.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        const message = await Message.create({
          roomId: data.roomId,
          sender: data.sender,
          content: data.content,
          timestamp: new Date()
        });

        const populatedMessage = await Message.findById(message._id)
          .populate({
            path: 'sender',
            model: User,
            select: 'username firstname lastname profileImageUrl'
          })
          .lean();

        io.to(data.roomId).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
  });

  return io;
}

module.exports = initializeSocket;
