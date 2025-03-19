const { User } = require('../models/userModel');
const { Notification } = require('../models/notificationModel');

const toggleFollow = async (req, res) => {
  const { userId, targetId } = req.body;
  
  if (!userId || !targetId) {
    return res.status(400).json({ msg: "User or target not found!" });
  }

  // Prevent self-following
  if (userId === targetId) {
    return res.status(400).json({ msg: "You cannot follow yourself" });
  }

  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ msg: "User or target user not found" });
    }

    const isFollowing = user.following.includes(targetId);

    if (isFollowing) {
      await User.updateOne(
        { _id: userId },
        { $pull: { following: targetId } }
      );
      await User.updateOne(
        { _id: targetId },
        { $pull: { followers: userId } }
      );
    } else {
      await User.updateOne(
        { _id: userId },
        { $push: { following: targetId } }
      );
      await User.updateOne(
        { _id: targetId },
        { $push: { followers: userId } }
      );

      // Create follow notification
      const notification = new Notification({
        userId: targetId,
        type: 'follow',
        triggeredBy: userId,
        message: 'started following you'
      });
      console.log('Creating follow notification:', notification); // Debug log
      await notification.save();
    }

    return res.status(200).json({ msg: isFollowing ? "Unfollowed" : "Followed" });
  } catch (err) {
    console.error("Error in toggleFollow:", err);
    return res.status(500).json({ msg: "Internal Server Problem", err: err.message });
  }
};


const checkFollowStatus = async (req, res) => {
  const { userId, targetId } = req.body;

  if (!userId || !targetId) {
    return res.status(400).json({ msg: "User or target not found!" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isFollowing = user.following.includes(targetId);
    return res.json({ isFollowing });
  } catch (err) {
    console.error("Error in checkFollowStatus:", err);
    return res.status(500).json({ msg: "Internal Server Problem", err: err.message });
  }
};

module.exports = { toggleFollow, checkFollowStatus };