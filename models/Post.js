const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    data: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
postSchema.index({ username: 1 });
postSchema.index({ last_updated: -1 });

module.exports = mongoose.model('Post', postSchema);
