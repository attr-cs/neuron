const express = require('express');
const postRouter = express.Router();
const { Post } = require('../models/postModel');
const verifyToken = require('../middlewares/verifyToken');

// ✅ GET all posts (sorted by latest)
postRouter.get('/', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username firstname lastname profileImageUrl')
      .sort({ createdAt: -1 });
    console.log(posts);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET logged-in user's posts
postRouter.get('/user', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ CREATE a new post
// CREATE a new post
postRouter.post('/user', verifyToken, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    const newPost = new Post({
      author: req.user.id,
      content,
      imageUrl
    });

    await newPost.save();
    
    // Fetch the saved post with populated author details
    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'username firstname lastname profileImageUrl');

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
    const post = await Post.findById(id).populate('author', 'username firstname lastname profileImageUrl');

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
    const { content, imageUrl } = req.body;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to edit this post' });
    }

    post.content = content;
    post.imageUrl = imageUrl;
    await post.save();

    res.json(post);
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

module.exports = postRouter;
