// models/Photo.js

const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    contest_title: String,
    uploaded_by: String,
    email: String,
    photo_url: String,
    extractedText: { type: String, default: "" },
    isSuspicious: { type: Boolean, default: false }
});

module.exports = mongoose.model('Photo', photoSchema);
