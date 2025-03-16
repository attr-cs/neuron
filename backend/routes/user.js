const express = require('express');
const userRouter = express.Router();
const bcrypt = require('bcryptjs');
const { userZod, userOAuthZod, userUpdateZod } = require('../zod/types');
const { v4 } = require('uuid');
const { User } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const { sendResetEmail } = require('../services/emailService');
const { toggleFollow, checkFollowStatus } = require('../controllers/userController');
const Contact = require('../models/Contact');
const axios = require('axios');
const FormData = require('form-data');

userRouter.use(express.json());

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

    res.status(200).json({ msg: "User created successfully!", token: jwtSign, userId, username: data.username });
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

    return res.status(200).json({ token, userId, username: fetchedUser.username });
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


// check username availability
userRouter.post('/check-username', async(req,res)=>{
    const username = req.body.username;
    const user = await User.findOne({username});
    return res.status(200).json({ exists: !!user})
})



userRouter.get('/userdetails/:username', verifyToken, async(req,res)=>{
    const username = req.params.username;
    const user = await User.findOne({username:username}, {
        username: 1,
        firstname: 1,
        lastname: 1,
        profileImage: 1,
        isAdmin: 1,
        isOnline: 1,
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
      // Update profile image if provided
      if (profileImage) {
        user.profileImage = profileImage;
        await user.save();
      }
      
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      return res.status(200).json({
        msg: "User logged in successfully",
        token,
        userId: user._id,
        username: user.username
      });
    }

    const username = await generateUniqueUsername(email.split('@')[0]);

    const newUser = await User.create({
      username,
      email,
      firstname,
      lastname,
      isOAuthUser: true,
      profileImage,
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
      username
    });

  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});userRouter.post('/google-auth', async (req,res)=>{
    const data = req.body;
    const {success,error} = userOAuthZod.safeParse(data);
    if(!success){
        return res.status(400).json({msg:"Invalid Data Format!",error:error});
    }

    const {email, firstname, lastname,  profileImageUrl} = req.body;

    const isExist = await User.findOne({email: email});

    if(isExist){
        const existId = isExist._id;
        const username = isExist.username;
        const token = jwt.sign({userId: existId, username: username}, process.env.JWT_SECRET, {expiresIn:'30d'});
        return res.status(200).json({msg:"User already exists", token: token, userId: existId, username: username});
    }

    const emailPrefix = email.split('@')[0];
    const username = await generateUniqueUsername(emailPrefix);

    const newUser = await User.create({
        username: username,
        email: email,
        firstname: firstname,
        lastname: lastname,
        isOAuthUser: true,
        profileImageUrl: profileImageUrl
    })
    const userId = newUser._id;
    const jwtSign = jwt.sign({userId:userId,  username: username},process.env.JWT_SECRET)

    return res.status(200).json({msg:"User created successfully!",token:jwtSign,userId:userId, username: username})
})

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



userRouter.post('/follow', verifyToken, toggleFollow);

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

userRouter.patch('/update', verifyToken, async (req, res) => {
  try {
    const { success, error } = userUpdateZod.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ msg: "Invalid Data Format!", error });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const updateFields = [
      'firstname', 'lastname', 'bio', 'gender',
      'location', 'birthdate', 'profileImage', 'bannerImage'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    return res.status(200).json({
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      bio: user.bio,
      gender: user.gender,
      location: user.location,
      birthdate: user.birthdate,
      profileImage: user.profileImage,
      bannerImage: user.bannerImage,
      isAdmin: user.isAdmin,
      isOnline: user.isOnline
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ msg: "Server error" });
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

userRouter.get('/followers/:username', verifyToken, async (req, res) => {
    const { username } = req.params;
    const followers = await User.find({ following: username });
    res.json(followers);
  });

userRouter.get('/following/:username', verifyToken, async (req, res) => {
    const { username } = req.params;
    const following = await User.find({ followers: username });
    res.json(following);
  });

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
      .select('username firstname lastname bio email location website profileImage bannerImage isAdmin createdAt followers following')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add follower status and counts
    const profileData = {
      ...user,
      isFollowedByMe: user.followers.some(id => id.toString() === req.user.id),
      followersCount: user.followers.length,
      followingCount: user.following.length,
      followers: undefined, // Don't send full arrays
      following: undefined // Don't send full arrays
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
      .populate('followers', 'username firstname lastname profileImage isAdmin followers')
      .lean();
    
    // Transform the data to match the expected format
    const followers = user.followers.map(follower => ({
      ...follower,
      profileImageUrl: follower.profileImage?.displayUrl // Handle the profileImage structure
    }));
    
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
      .populate('following', 'username firstname lastname profileImage isAdmin followers')
      .lean();
    
    // Transform the data to match the expected format
    const following = user.following.map(followed => ({
      ...followed,
      profileImageUrl: followed.profileImage?.displayUrl // Handle the profileImage structure
    }));
    
    res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Error fetching following' });
  }
});

// Follow/Unfollow user
userRouter.post('/follow/:userId', verifyToken, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = userToFollow.followers.includes(req.user.id);

    if (isFollowing) {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.id);
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
    } else {
      // Follow
      userToFollow.followers.push(req.user.id);
      currentUser.following.push(req.params.userId);
    }

    await userToFollow.save();
    await currentUser.save();

    res.json({ followers: userToFollow.followers });
  } catch (error) {
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
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        bannerImage: {
          imageId: imageData.imageId,
          url: imageData.url,
          thumbUrl: imageData.thumbUrl,
          displayUrl: imageData.displayUrl
        }
      },
      { new: true }
    ).select('bannerImage');

    res.json({ bannerImage: user.bannerImage });
  } catch (error) {
    console.error('Error updating banner image:', error);
    res.status(500).json({ message: 'Failed to update banner image' });
  }
});

module.exports = userRouter;
