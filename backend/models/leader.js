const mongoose = require('mongoose');

const leaderSchema = new mongoose.Schema({
    title: { type: String },
    content: { type: String },
    image: { type: String },
    type: { type: String},
    tags: { type: [String] },
    featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('leader', leaderSchema);
