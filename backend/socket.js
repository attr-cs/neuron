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

    socket.on('user_connected', async (userId) => {
      console.log('User connected with ID:', userId);
      
      // Update user's online status and last visited time
      await User.findByIdAndUpdate(userId, { 
        isOnline: true,
        lastVisited: new Date() 
      });
      
      onlineUsers.set(userId, socket.id);
      
      // Broadcast to all clients that this user is online
      io.emit('user_status_change', { 
        userId, 
        status: 'online',
        lastVisited: new Date()
      });
      
      // Send current online users list to the newly connected user
      const onlineUsersList = Array.from(onlineUsers.keys());
      socket.emit('online_users_list', onlineUsersList);
    });

    socket.on('get_user_status', async (userId) => {
      const isOnline = onlineUsers.has(userId);
      const user = await User.findById(userId).select('lastVisited');
      
      socket.emit('user_status_change', { 
        userId, 
        status: isOnline ? 'online' : 'offline',
        lastVisited: user?.lastVisited || null
      });
    });

    socket.on('disconnect', async () => {
      let disconnectedUserId;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          // Update user's offline status and last visited time
          await User.findByIdAndUpdate(disconnectedUserId, { 
            isOnline: false,
            lastVisited: new Date() 
          });
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        // Broadcast to all clients that this user is offline
        io.emit('user_status_change', { 
          userId: disconnectedUserId, 
          status: 'offline',
          lastVisited: new Date()
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

    socket.on('typing_start', (data) => {
      socket.to(data.roomId).emit('typing_notify', {
        userId: data.userId,
        isTyping: true
      });
    });

    socket.on('typing_end', (data) => {
      socket.to(data.roomId).emit('typing_notify', {
        userId: data.userId,
        isTyping: false
      });
    });
  });

  return io;
}

module.exports = initializeSocket;
