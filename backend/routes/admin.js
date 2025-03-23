const express = require('express');
const router = express.Router();
const { User } = require('../models/userModel');
const { adminMiddleware } = require('../middlewares/adminMiddleware');
const { Notification } = require('../models/notificationModel');
const verifyToken = require('../middlewares/verifyToken');

router.post('/broadcast', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const users = await User.find({ isBanned: { $ne: true } }, '_id');
    
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'broadcast',
      triggeredBy: req.user.id,
      message: `${message}`,
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    res.json({ message: 'Broadcast sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending broadcast' });
  }
});

router.get('/users', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}, {
      username: 1,
      firstname: 1,
      lastname: 1,
      email: 1,
      profileImage: 1,
      isAdmin: 1,
      isOnline: 1,
      lastSeen: 1,
      createdAt: 1,
      isBanned: 1,
      isVerified: 1
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit + 1);

    const hasMore = users.length > limit;
    const usersToSend = hasMore ? users.slice(0, -1) : users;

    res.json({ 
      users: usersToSend,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;