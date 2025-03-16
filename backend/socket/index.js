const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { User } = require('../models/userModel');
const { Message } = require('../models/messageModel');

function initializeSocket(server) {
  // Add rate limiting
  const messageRateLimit = new Map();
  const MESSAGE_LIMIT = 10;
  const TIME_WINDOW = 5000; // 5 seconds

  // Add connection pooling
  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User left room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, sender } = data;

        // Create new message
        const newMessage = new Message({
          roomId,
          content,
          sender,
          timestamp: new Date()
        });

        // Save to database
        await newMessage.save();

        // Populate sender details with correct model name 'users'
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'username firstname lastname profileImage', 'users')
          .lean();

        // Broadcast to room immediately
        io.to(roomId).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('user_connected', async (userId) => {
      try {
        if (!userId) return;
      
      onlineUsers.set(userId, socket.id);
        
        // Update user's online status in database
        await User.findByIdAndUpdate(userId, { 
          isOnline: true,
          lastSeen: new Date()
        });
      
      // Broadcast to all clients that this user is online
      io.emit('user_status_change', { 
        userId, 
        status: 'online',
        lastSeen: new Date()
      });
      
        // Send current online users list
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
      } catch (error) {
        console.error('Error in user_connected:', error);
      }
    });

    socket.on('user_disconnected', async (userId) => {
      onlineUsers.delete(userId);
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
      
      // Update user's offline status in database
      await User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastSeen: new Date()
      });
    });

    socket.on('get_user_status', async (userId) => {
      const isOnline = onlineUsers.has(userId);
      const user = await User.findById(userId).select('lastSeen');
      
      socket.emit('user_status_change', { 
        userId, 
        status: isOnline ? 'online' : 'offline',
        lastSeen: user?.lastSeen || null
      });
    });

    socket.on('typing_start', ({ roomId, userId }) => {
      socket.to(roomId).emit('typing_notify', { userId, isTyping: true });
    });

    socket.on('typing_end', ({ roomId, userId }) => {
      socket.to(roomId).emit('typing_notify', { userId, isTyping: false });
    });

    socket.on('disconnect', async () => {
      try {
        // Find userId by socket id
      let disconnectedUserId;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
          
          // Update user's offline status in database
          await User.findByIdAndUpdate(disconnectedUserId, { 
          isOnline: false,
          lastSeen: new Date()
        });
          
          // Broadcast user's offline status
        io.emit('user_status_change', { 
          userId: disconnectedUserId, 
          status: 'offline',
            lastSeen: new Date()
          });
          
          // Update online users list
          io.emit('online_users_list', Array.from(onlineUsers.keys()));
        }
      } catch (error) {
        console.error('Error in disconnect handler:', error);
      }
    });
  });

  // Periodic cleanup of rate limit data
  setInterval(() => {
    const now = Date.now();
    for (const [userId, timestamps] of messageRateLimit.entries()) {
      const recentMessages = timestamps.filter(time => now - time < TIME_WINDOW);
      if (recentMessages.length === 0) {
        messageRateLimit.delete(userId);
      } else {
        messageRateLimit.set(userId, recentMessages);
      }
    }
  }, TIME_WINDOW);

  // Periodic cleanup of inactive users
  setInterval(async () => {
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    for (const [userId, lastActive] of onlineUsers.entries()) {
      if (now - lastActive > inactiveThreshold) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date()
        });
      }
    }

    io.emit('online_users_list', Array.from(onlineUsers.keys()));
  }, 60000); // Check every minute

  return io;
}

module.exports = initializeSocket;
