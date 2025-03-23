const express = require('express');
const chatRouter = express.Router();
const { Message } = require('../models/messageModel');
const { User } = require('../models/userModel');
const verifyToken = require('../middlewares/verifyToken');
const { Notification } = require('../models/notificationModel');
const { adminMiddleware } = require('../middlewares/adminMiddleware');
// Get chat history
chatRouter.get('/messages/:roomId', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId.includes('-')) {
      return res.status(400).json({ message: 'Invalid room ID format' });
    }

    // Debug log
    console.log('User from token:', req.user);
    console.log('Room ID:', roomId);

    // Verify that the requesting user is part of this chat
    const [user1, user2] = roomId.split('-');

    if (user1 !== req.user.id && user2 !== req.user.id ) {
      return res.status(403).json({ message: 'Unauthorized to access these messages' });
    }

    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })
      .populate({
        path: 'sender',
        model: User,
        select: 'username firstname lastname profileImageUrl'
      })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error('Server error in /messages/:roomId:', error);
    res.status(500).json({ 
      message: 'Error fetching messages',
      error: error.message 
    });
  }
});

// Delete chat history (optional)
chatRouter.delete('/messages/:roomId', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const [user1, user2] = roomId.split('-');
    
    if (req.user.id !== user1 && req.user.id !== user2) {
      return res.status(403).json({ message: 'Unauthorized to delete these messages' });
    }

    await Message.deleteMany({ roomId });
    res.json({ message: 'Chat history deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting messages' });
  }
});

// Pin/unpin message
chatRouter.post('/pin-message', verifyToken, async (req, res) => {
  try {
    const { messageId, roomId } = req.body;
    const [user1, user2] = roomId.split('-');
    
    if (req.user.id !== user1 && req.user.id !== user2) {
      return res.status(403).json({ message: 'Unauthorized to pin messages in this chat' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // If we're pinning a message, unpin any existing pinned message
    if (!message.isPinned) {
      await Message.updateMany(
        { roomId: message.roomId, isPinned: true },
        { isPinned: false, pinnedBy: null, pinnedAt: null }
      );
    }

    message.isPinned = !message.isPinned;
    message.pinnedBy = message.isPinned ? req.user.id : null;
    message.pinnedAt = message.isPinned ? new Date() : null;
    await message.save();

    // Get all messages to return updated state
    const messages = await Message.find({ roomId: message.roomId })
      .populate('sender')
      .sort({ timestamp: 1 });

    res.json({ 
      messages,
      pinnedMessage: message.isPinned ? message : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pin status' });
  }
});

chatRouter.get('/latest-messages', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const messages = await Message.find()
      .populate('sender', 'username firstname lastname profileImage isBanned isAdmin')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a new message
chatRouter.post('/messages', verifyToken, async (req, res) => {
  try {
    const { roomId, content } = req.body;

    if (!content || !roomId) {
      return res.status(400).json({ message: 'Message content and roomId are required' });
    }

    // Extract user IDs from roomId
    const [user1, user2] = roomId.split('-');
    
    // Validate that the sender is part of the chat
    if (user1 !== req.user.id && user2 !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to send message in this chat' });
    }

    // Determine recipient
    const recipientId = user1 === req.user.id ? user2 : user1;

    // Prevent self-messaging notification
    if (recipientId !== req.user.id) {
      const notification = new Notification({
        userId: recipientId,
        type: 'message',
        triggeredBy: req.user.id,
        message: content.substring(0, 100)
      });
      await notification.save();
    }

    const newMessage = new Message({
      sender: req.user.id,
      content,
      roomId,
      timestamp: new Date()
    });

    await newMessage.save();

    // Populate sender details before sending response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username firstname lastname profileImage isAdmin')
      .lean();

    // Emit the message through socket.io (you'll need to set up socket.io in your main server file)
    req.app.get('io').to(roomId).emit('receive_message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = chatRouter; 