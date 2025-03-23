const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true, 
    minLength: 3, 
    maxLength: 30,
    match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscore and hyphen'],
    index: true 
  },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  firstname: { type: String, required: true, trim: true, maxLength: 50 },
  lastname: { type: String, required: true, trim: true, maxLength: 50 },
  password: { type: String, default: "" },
  profileImage: {
    imageId: { type: String, default: "" },
    url: { type: String, default: "" },
    thumbUrl: { type: String, default: "" },
    displayUrl: { type: String, default: "" },
  },
  bannerImage: {
    imageId: { type: String, default: "" },
    url: { type: String, default: "" },
    thumbUrl: { type: String, default: "" },
    displayUrl: { type: String, default: "" },
  },
  bio: { type: String, maxLength: 150, default: "" },
  gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },
  location: { type: String, maxLength: 60, default: "" },
  birthdate: { type: Date },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isOnline: { type: Boolean, default: false },
  isOAuthUser: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  website: String,
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model("users", userSchema);
module.exports = { User };
