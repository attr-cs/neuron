const express = require('express');
const postRouter = express.Router();
const { Post } = require('../models/postModel');
const verifyToken = require('../middlewares/verifyToken');
const { User } = require('../models/userModel');
const { Notification } = require('../models/notificationModel');

// ✅ GET all posts (sorted by latest)
postRouter.get('/', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username firstname lastname profileImage')
      .select('-comments')
      .sort({ createdAt: -1 });
    
    const postsWithLikeInfo = posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user.id),
      commentsCount: post.comments?.length || 0
    }));

    res.json(postsWithLikeInfo);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET logged-in user's posts
postRouter.get('/user', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate('author', 'username firstname lastname profileImage')
      .select('-comments')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to extract mentions from text
const extractMentions = (text) => {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(match => match.slice(1)) : [];
};

// ✅ CREATE a new post
postRouter.post('/user', verifyToken, async (req, res) => {
  try {
    const { content, images } = req.body;
    
    const newPost = new Post({
      author: req.user.id,
      content,
      images: images.map(img => ({
        imageId: img.imageId,
        url: img.url,
        thumbUrl: img.thumbUrl,
        displayUrl: img.displayUrl
      }))
    });

    await newPost.save();
    
    // Handle mentions
    const mentions = extractMentions(content);
    if (mentions.length > 0) {
      // Get all mentioned users except the author
      const mentionedUsers = await User.find({
        username: { $in: mentions },
        _id: { $ne: req.user.id } // Exclude the author
      });

      // Create notifications for mentioned users
      const notifications = mentionedUsers.map(user => ({
        userId: user._id,
        type: 'mention',
        triggeredBy: req.user.id,
        postId: newPost._id,
        message: content
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'username firstname lastname profileImage');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a post
postRouter.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      author: req.user.id,
      content,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Only create notification if commenter is not the post author
    if (post.author.toString() !== req.user.id) {
      const notification = new Notification({
        userId: post.author,
        type: 'comment',
        triggeredBy: req.user.id,
        postId: post._id,
        message: content
      });
      await notification.save();
    }

    // Handle mentions in comments
    const mentions = extractMentions(content);
    if (mentions.length > 0) {
      // Get all mentioned users except the commenter and post author
      const mentionedUsers = await User.find({
        username: { $in: mentions },
        _id: { 
          $nin: [req.user.id, post.author] // Exclude both commenter and post author
        }
      });

      // Create notifications for mentioned users
      const notifications = mentionedUsers.map(user => ({
        userId: user._id,
        type: 'mention',
        triggeredBy: req.user.id,
        postId: post._id,
        message: content
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    // Populate the new comment's author information
    const populatedPost = await Post.findById(post._id)
      .populate('comments.author', 'username firstname lastname profileImage');

    const addedComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json(addedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
postRouter.get('/:id/comments', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .select('comments')
      .populate('comments.author', 'username firstname lastname profileImage');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET a single post by ID
postRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate('author', 'username firstname lastname profileImage');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ UPDATE a post (only owner can update)
postRouter.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, images } = req.body;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to edit this post' });
    }

    post.content = content;
    post.images = images.map(img => ({
      imageId: img.imageId,
      url: img.url,
      thumbUrl: img.thumbUrl,
      displayUrl: img.displayUrl
    }));
    
    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('author', 'username firstname lastname profileImage');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE a post (only owner can delete)
postRouter.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new route to get user's posts by username
postRouter.get('/user/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username firstname lastname profileImage')
      .select('-comments')
      .sort({ createdAt: -1 });
      
    const postsWithLikeInfo = posts.map(post => ({
      ...post.toObject(),
      likes: post.likes || [],
      isLiked: (post.likes || []).includes(req.user.id),
      commentsCount: post.comments?.length || 0
    }));

    res.json(postsWithLikeInfo);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a post
postRouter.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() === req.user.id) {
      return res.status(403).json({ message: "You can't like your own post" });
    }

    const isLiked = post.likes.includes(req.user.id);
    
    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like the post
      post.likes.push(req.user.id);
      
      // Create notification for post author
      const notification = new Notification({
        userId: post.author,
        type: 'like',
        triggeredBy: req.user.id,
        postId: post._id,
        message: post.content.substring(0, 100)
      });
      console.log('Creating like notification:', notification); // Debug log
      await notification.save();
    }

    await post.save();

    // Return the updated likes array and count
    res.json({ 
      likes: post.likes,
      likesCount: post.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = postRouter;
