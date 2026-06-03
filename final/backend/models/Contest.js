const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    title: String,
    description: String,
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    winnerName: { type: String, default: "" },
    winnerPhotoUrl: { type: String, default: "" },
    status: { type: String, default: "active" } // "active" or "ended"
});

module.exports = mongoose.model('Contest', contestSchema);
