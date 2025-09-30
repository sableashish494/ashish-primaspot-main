const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
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
reelSchema.index({ username: 1 });
reelSchema.index({ last_updated: -1 });

module.exports = mongoose.model('Reel', reelSchema);
