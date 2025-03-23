const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'mention', 'message', 'broadcast', 'personal'],
        required: true
    },

    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: function() { return this.type === 'like' || this.type === 'comment' || this.type === 'mention'; }
    },

    message: {
        type: String,
        required: true
    },

    isRead: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });


const Notification = mongoose.model('notifications', notificationSchema);

module.exports = { Notification };