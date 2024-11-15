const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        trim: true,
        required: function() {return !this.imageUrl;},
    },
    imageUrl: {
        type: String,
        required: false
    },



    likes: [
        {
            type: mongoose.Schema.Types.ObjectId
        },
    ],

    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    likes: {
        type: Number,
        default: 0,
    },

    isEdited: {
        type: Boolean,
        default: false
    },

    editHistory: [
        {
            editedAt: {
                type: Date, 
                default: Date.now
            },
            content: {
                type: String
            },
        },
    ],

    isDeleted: { type: Date, default: false},

    dateCreated: {
        type: Date,
        default: Date.now,
        immutable: true,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },


}, { timestamps: true });


const Post = mongoose.model('post', postSchema);

module.exports = { Post };