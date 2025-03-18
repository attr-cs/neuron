const express = require('express');
const postRouter = express.Router();
const { Post } = require('../models/postModel');
const verifyToken = require('../middlewares/verifyToken');
const { User } = require('../models/userModel');

// ✅ GET all posts (sorted by latest)
postRouter.get('/', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username firstname lastname profileImage')
      .sort({ createdAt: -1 });
    
    // Add isLiked field to each post
    const postsWithLikeInfo = posts.map(post => ({
      ...post.toObject(),
      isLiked: post.likes.includes(req.user.id)
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
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
    
    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'username firstname lastname profileImage');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
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
      .sort({ createdAt: -1 });
      
    // Add isLiked field to each post
    const postsWithLikeInfo = posts.map(post => ({
      ...post.toObject(),
      likes: post.likes || [], // Ensure likes exists
      isLiked: (post.likes || []).includes(req.user.id)
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

    // Initialize likes array if it doesn't exist
    if (!post.likes) {
      post.likes = [];
    }

    const isLiked = post.likes.includes(req.user.id);
    
    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like the post
      post.likes.push(req.user.id);
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
