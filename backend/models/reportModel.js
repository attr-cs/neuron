const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({

    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    target: {
        targetType: {
            type: String,
            enum: ['user', 'post'],
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'target.targetType',
        },
    },

    reason: {
        type: String,
        enum: [
            'Spam',
            'Harassment',
            'Inappropriate Content',
            'Misinformation',
            'Other'
        ],
        required: true,
    },

    details: {
        type: String,
        maxlength: 500,
    },

    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'rejected'],
        default: 'pending',
    },

}, {timestamps: true})


const Report = mongoose.model('report', reportSchema);

module.exports = { Report };