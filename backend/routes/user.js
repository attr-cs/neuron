const express = require('express');
const userRouter = express.Router();
const bcrypt = require('bcryptjs');
const { userZod, userOAuthZod, userUpdateZod } = require('../zod/types');
const { v4 } = require('uuid');
const { User } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { adminMiddleware } = require('../middlewares/adminMiddleware');
const verifyToken = require('../middlewares/verifyToken');
const { sendResetEmail } = require('../services/emailService');
const { toggleFollow, checkFollowStatus } = require('../controllers/userController');
const Contact = require('../models/Contact');
const axios = require('axios');
const FormData = require('form-data');
const { Notification } = require('../models/notificationModel');

userRouter.use(express.json());
// Ban user endpoint
userRouter.post('/ban', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: true },
      { new: true }
    ).select('username firstname lastname profileImage isBanned');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error banning user' });
  }
});

// Add this route after the ban user endpoint
userRouter.post('/unban', verifyToken, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: false },
      { new: true }
    ).select('username firstname lastname profileImage isBanned');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error unbanning user' });
  }
});

userRouter.get('/status/:userId', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .select('lastSeen')
        .lean();
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ lastSeen: user.lastSeen });
    } catch (error) {
      console.error('Error fetching user status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// signup api
userRouter.post('/signup', async (req, res) => {
    const data = req.body;
    const { success, error } = userZod.safeParse(data);

    if (!success) {
        return res.status(400).json({ msg: "Invalid Data Format!", error: error });
    }

    const isExist = await User.findOne({
        $or: [{ email: data.email }, { username: data.username }]
    });

    if (isExist) {
        if (isExist.email === data.email) {
            return res.status(400).json({ msg: "Email already registered!" });
        }
        if (isExist.username === data.username) {
            return res.status(400).json({ msg: "Username is already taken!" });
        }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await User.create({
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        username: data.username,
        password: hashedPassword
    });

    const userId = newUser._id;
    const jwtSign = jwt.sign({ userId, username: data.username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({ msg: "User created successfully!", token: jwtSign, userId, username: data.username, isBanned: newUser.isBanned });
});

userRouter.post('/signin', async (req, res) => {
    const { username: identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: "Identifier and Password are required" });
    }

    const fetchedUser = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
    });

    if (!fetchedUser) {
        return res.status(401).json({ msg: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, fetchedUser.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid Password' });
    }

    const userId = fetchedUser._id;
    const token = jwt.sign({ userId, username: fetchedUser.username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({ token, userId, username: fetchedUser.username, isBanned: fetchedUser.isBanned });
});



userRouter.get('/userslist', verifyToken, async (req,res)=>{
    try {
        const users = await User.find({}, {
            username: 1,
            firstname: 1,
            lastname: 1,
            'profileImage.thumbUrl': 1,
            isAdmin: 1,
            followers: 1,
            isOnline: 1,
            lastSeen: 1
        });
        return res.status(200).json({users});
    } catch(err) {
        return res.status(500).json({msg:`Error fetching users: ${err}`});
    }
}) 


// Add this validation function
const isValidUsername = (username) => {
  const regex = /^[a-z0-9_-]+$/;
  return regex.test(username);
};

// Update the check-username route
userRouter.post('/check-username', verifyToken, async (req, res) => {
  try {
    const { username } = req.body;
    
    // Validate username format
    if (!isValidUsername(username)) {
      return res.status(400).json({ 
        message: 'Username can only contain lowercase letters, numbers, underscore and hyphen'
      });
    }

    // Check if username exists
    const user = await User.findOne({ 
      username: username.toLowerCase(),
      _id: { $ne: req.user.id }
    });

    return res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



userRouter.get('/userdetails/:username', verifyToken, async(req,res)=>{
    const username = req.params.username;
    const user = await User.findOne({username:username}, {
        username: 1,
        firstname: 1,
        lastname: 1,
        profileImage: 1,
        isAdmin: 1,
        isOnline: 1,
        isBanned: 1,
    });
    if(!user){
        return res.status(400).json({"msg":"User doesn't exist!"});
    }
    return res.status(200).json({user});
})

// OAuth2.0 google
userRouter.post('/google-auth', async (req, res) => {
  try {
    const { email, firstname, lastname, profileImage } = req.body;
    
    const { success, error } = userOAuthZod.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ msg: "Invalid Data Format!", error });
    }

    let user = await User.findOne({ email });
    
    if (user) {
      // Don't update existing user's data
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      return res.status(200).json({
        msg: "User logged in successfully",
        token,
        userId: user._id,
        username: user.username,
        isBanned: user.isBanned
      });
    }

    // Only create new user if doesn't exist
    const username = await generateUniqueUsername(email.split('@')[0]);
    const newUser = await User.create({
      username,
      email,
      firstname,
      lastname,
      isOAuthUser: true,
      profileImage: profileImage || {
        imageId: "",
        url: "",
        thumbUrl: "",
        displayUrl: ""
      },
      lastSeen: new Date(),
      isOnline: true
    });

    const token = jwt.sign(
      { userId: newUser._id, username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      msg: "User created successfully!",
      token,
      userId: newUser._id,
      username,
      isBanned: newUser.isBanned
    });

  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

userRouter.post("/create-password", async (req,res)=>{
    const {userId, newPassword} = req.body;
    try{
        const user = await User.findById(userId);
        if(!user || !user.isOAuthUser){
            return res.status(400).json({msg:"invalid request"})
        }

        const hashedPass = await bcrypt.hash(newPassword, 10);
        user.password = hashedPass;
        user.isOAuthUser = false;
        await user.save();

        return res.status(200).json({msg:"Password created successfully!"})
    }catch(err){
        return res.status(500).json({msg:err})
    }
})

userRouter.post("/request-reset",async (req,res)=>{
    const { email } = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({msg:"User not found!"})
        }
        
        if(user.isOAuthUser){
            return res.status(405).json({msg:"Account not setup, try signing in with google and create a password!"})
        }
        
        
        const resetToken = v4()
        
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save();
        

        await sendResetEmail(user.email, resetToken);
        
        return res.json({msg:"Reset email sent!"})

    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"})
    }
})



userRouter.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// userRouter.post('/follow', verifyToken, async (req, res) => {
//   try {
//     const { userId, targetId } = req.body;

//     const user = await User.findById(userId);
//     const target = await User.findById(targetId);

//     if (!user || !target) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const isFollowing = user.followers.includes(targetId);

//     // Use $pull or $push based on current state
//     const [updatedUser, updatedTarget] = await Promise.all([
//       User.findByIdAndUpdate(
//         userId,
//         {
//           [isFollowing ? '$pull' : '$push']: {
//             followers: targetId
//           }
//         },
//         { new: true }
//       ),
//       User.findByIdAndUpdate(
//         targetId,
//         {
//           [isFollowing ? '$push' : '$pull']: {
//             following: userId
//           }
//         },
//         { new: true }
//       )
//     ]);

//     if (!isFollowing) {
//       // After adding the follow
//       const notification = new Notification({
//         userId: targetId,
//         type: 'follow',
//         triggeredBy: userId,
//         message: 'started following you'
//       });
//       await notification.save();
//     }

//     res.json({ 
//       success: true,
//       isFollowing: !isFollowing,
//       followers: updatedUser.followers 
//     });
//   } catch (error) {
//     console.error('Error updating follow status:', error);
//     res.status(500).json({ message: 'Error updating follow status' });
//   }
// });

userRouter.get('/follow-status', verifyToken, checkFollowStatus)



const generateUniqueUsername = async (baseUsername)=>{
    let username = baseUsername;
    let userExists = await User.findOne({username});
    let counter = 1;

    while(userExists){
        username = `${baseUsername}${counter}`;
        userExists = await User.findOne({username});
        counter++;
    }

    return username;
}

userRouter.get('/:username', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username firstname lastname profileImage isAdmin isOnline');

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ msg: "Server error" });
  }
});

userRouter.post('/update', verifyToken, async (req, res) => {
  try {
    const updateFields = [
      'firstname', 'lastname', 'bio', 'gender',
      'location', 'birthdate', 'website', 'username'
    ];

    const updateData = {};
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'username') {
          // Validate username format
          if (!isValidUsername(req.body[field])) {
            throw new Error('Invalid username format');
          }
          updateData[field] = req.body[field].toLowerCase();
        } else if (field === 'birthdate' && req.body[field]) {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field] || null;
        }
      }
    });

    // If username is being updated, check availability
    if (updateData.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message === 'Invalid username format') {
      return res.status(400).json({ 
        message: 'Username can only contain lowercase letters, numbers, underscore and hyphen'
      });
    }
    res.status(500).json({ message: 'Failed to update user information' });
  }
});

userRouter.post('/update-status', verifyToken, async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
          lastVisited: req.body.lastVisited,
          isOnline: true
        },
        { new: true }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

userRouter.get('/status/:userId', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .select('isOnline lastVisited');
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user status" });
    }
  });

// userRouter.get('/followers/:username', verifyToken, async (req, res) => {
//     const { username } = req.params;
//     const followers = await User.find({ following: username });
//     res.json(followers);
//   });

// userRouter.get('/following/:username', verifyToken, async (req, res) => {
//     const { username } = req.params;
//     const following = await User.find({ followers: username });
//     res.json(following);
//   });

userRouter.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    await newContact.save();

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message', 
      error: error.message 
    });
  }
});

// Get user profile with follower status and counts
userRouter.get('/profile/:username', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username firstname lastname bio location website profileImage bannerImage isAdmin createdAt followers following gender birthdate isBanned')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileData = {
      ...user,
      isFollowedByMe: user.followers.some(id => id.toString() === req.user.id),
      followersCount: user.followers.length,
      followingCount: user.following.length,
      followers: undefined,
      following: undefined
    };

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get user's followers
userRouter.get('/followers/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('followers')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = await User.find(
      { _id: { $in: user.followers } },
      'username firstname lastname profileImage isAdmin followers'
    ).lean();
    
    res.json(followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Error fetching followers' });
  }
});

// Get user's following
userRouter.get('/following/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('following')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = await User.find(
      { _id: { $in: user.following } },
      'username firstname lastname profileImage isAdmin followers'
    ).lean();
    
    res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Error fetching following' });
  }
});

// Follow/Unfollow user
userRouter.post('/follow/:userId', verifyToken, async (req, res) => {
  try {
    const [userToFollow, currentUser] = await Promise.all([
      User.findById(req.params.userId),
      User.findById(req.user.id || req.user._id)
    ]);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = userToFollow.followers.includes(req.user.id || req.user._id);

    // Use $pull or $push based on current state
    const [updatedUserToFollow, updatedCurrentUser] = await Promise.all([
      User.findByIdAndUpdate(
        req.params.userId,
        {
          [isFollowing ? '$pull' : '$push']: {
            followers: req.user.id || req.user._id
          }
        },
        { new: true }
      ),
      User.findByIdAndUpdate(
        req.user.id || req.user._id,
        {
          [isFollowing ? '$pull' : '$push']: {
            following: req.params.userId
          }
        },
        { new: true }
      )
    ]);

    if (!isFollowing) {
      // After adding the follow
      const notification = new Notification({
        userId: req.params.userId,
        type: 'follow',
        triggeredBy: req.user.id || req.user._id,
        message: 'started following you'
      });
      await notification.save();
    }

    res.json({ 
      success: true,
      isFollowing: !isFollowing,
      followers: updatedUserToFollow.followers 
    });
  } catch (error) {
    console.error('Error updating follow status:', error);
    res.status(500).json({ message: 'Error updating follow status' });
  }
});


userRouter.post('/update-profile-image', verifyToken, async (req, res) => {
  try {
    const { imageData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        profileImage: {
          imageId: imageData.imageId,
          url: imageData.url,
          thumbUrl: imageData.thumbUrl,
          displayUrl: imageData.displayUrl
        }
      },
      { new: true }
    ).select('profileImage');

    res.json({ profileImage: user.profileImage });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: 'Failed to update profile image' });
  }
});

userRouter.post('/update-banner-image', verifyToken, async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData || !imageData.url) {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    // Log for debugging
    console.log('User ID:', req.user.id || req.user._id);
    console.log('Image Data:', imageData);

    const updateData = {
      bannerImage: {
        imageId: imageData.imageId || "",
        url: imageData.url,
        thumbUrl: imageData.thumbUrl || imageData.url,
        displayUrl: imageData.displayUrl || imageData.url
      }
    };

    const user = await User.findByIdAndUpdate(
      req.user.id || req.user._id, // Handle both possible properties
      { $set: updateData },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ bannerImage: user.bannerImage });
  } catch (error) {
    console.error('Error updating banner image:', error);
    res.status(500).json({ message: 'Failed to update banner image' });
  }
});

module.exports = userRouter;
