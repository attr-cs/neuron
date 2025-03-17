const express = require('express');
const router = express.Router();
const Report = require('../models/reportModel');
const  verifyToken  = require('../middlewares/verifyToken');

// Create a new report
router.post('/create', verifyToken, async (req, res) => {
  try {
    console.log('Received report data:', req.body);
    console.log('User making report:', req.user);

    const { targetType, targetId, targetUser, reasons, message } = req.body;

    // Validate required fields
    if (!targetType || !targetId || !targetUser || !reasons || !reasons.length) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    // Check if user has already reported this content
    const existingReport = await Report.findOne({
      reporter: req.user.id,
      targetType,
      targetId
    });

    if (existingReport) {
      return res.status(400).json({
        message: 'You have already reported this content'
      });
    }

    const report = new Report({
      reporter: req.user.id,
      targetType,
      targetId,
      targetUser,
      reasons,
      message,
      status: 'pending'
    });

    await report.save();
    console.log('Report created:', report);

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      message: 'Failed to submit report'
    });
  }
});

// Get reports for a specific user's content (for the content owner)
router.get('/received', verifyToken, async (req, res) => {
  try {
    const reports = await Report.find({ targetUser: req.user.id })
      .populate('reporter', 'username firstname lastname profileImage')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch reports'
    });
  }
});

// Get reports made by the user
router.get('/submitted', verifyToken, async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user.id })
      .populate('targetUser', 'username firstname lastname profileImage')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch reports'
    });
  }
});

module.exports = router; 