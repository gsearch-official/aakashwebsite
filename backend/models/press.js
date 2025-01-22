const mongoose = require('mongoose');

const pressSchema = new mongoose.Schema({
    title: { type: String },
    content: { type: String },
    image: {
        data: Buffer,  // Store image data as a Buffer
        contentType: String  // Store MIME type of the image (e.g., image/jpeg)
    },
    type: { type: String},
    tags: { type: [String] },
    featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('press', pressSchema);
