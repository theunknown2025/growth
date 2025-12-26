const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;