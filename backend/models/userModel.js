const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    password: {
      type: String,
      default: "",
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxLength: 150,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    location: {
      type: String,
      maxLength: 60,
      default: "",
    },
    birthdate: {
      type: Date,
    },
    bannerImageUrl: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOAuthUser: {
      type: Boolean,
      default: false,
    },
    websiteUrl: {
      type: String,
      default: "",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    recentActivity: [
      {
        type: String,
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);

module.exports = { User };
