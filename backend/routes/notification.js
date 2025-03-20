const express = require('express');
const router = express.Router();
const { Notification } = require('../models/notificationModel');
const verifyToken = require('../middlewares/verifyToken');

// Get notifications for the user
router.get('/', verifyToken, async (req, res) => {
  try {
    const query = { userId: req.user.id };
    
    // Add isRead filter if unreadOnly is true
    if (req.query.unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate({
        path: 'triggeredBy',
        model: 'users',
        select: 'username firstname lastname profileImage'
      })
      .populate({
        path: 'postId',
        model: 'Post',
        select: 'content'
      })
      .sort({ createdAt: -1 });

    console.log('Fetched notifications:', notifications);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notifications as read
router.put('/mark-read', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
});

// Get unread notifications count
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

module.exports = router; 