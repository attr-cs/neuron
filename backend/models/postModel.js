const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  content: { type: String, required: true },
  images: [{
    imageId: { type: String, required: true },
    url: { type: String, required: true },
    thumbUrl: { type: String },
    displayUrl: { type: String },
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);
module.exports = { Post };
