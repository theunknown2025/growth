const { getAIResponse , generateConversationTitle } = require('../service/answer'); 
const SimpleTest = require('../models/SimpleTest'); 
const Conversation = require('../models/Conversation');

const createConversation = async (req , res) => {
    const conversationTitle = await generateConversationTitle(req.body.title);

    const conversation = new Conversation({
        title: conversationTitle,
        userId: req.user.id, 
    });
    await conversation.save();
    return res.status(201).json(conversation);
}

const getAllConversations = async (req , res) => {
    const conversations = await Conversation.find({ userId: req.user.id });    
    res.json(conversations);
}

const getConversation = async (req , res) => {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    
    res.json(conversation);
}

const deleteConversation = async (req , res) => {
    const { id } = req.params;
    const conversation = await Conversation.findByIdAndDelete(id);
    
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    
    res.json({ message: "Conversation deleted successfully" });
}

const getAIanswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { sender, message } = req.body;
        
        const conversation = await Conversation.findById(id);
        
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        
        // Save the user message
        conversation.messages.push({ sender, message });
        
        // Get AI response
        const aiMessage = await getAIResponse(message);
        
        // Save the AI message
        conversation.messages.push({ sender: 'AI', message: aiMessage });
        
        await conversation.save();
        
        res.json({ message: aiMessage });
    } catch (error) {
        console.error("Evaluation error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAIanswer , 
    createConversation,
    getConversation,
    deleteConversation,
    getAllConversations
};