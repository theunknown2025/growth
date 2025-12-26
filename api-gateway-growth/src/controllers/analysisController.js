const SimpleTest = require('../models/SimpleTest'); 
const AdvancedTest = require('../models/AdvancedTest');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const getDashboardCounts = async (req, res) => {
    try {
        const [
            conversationCount,
            usersCount,
            simpleTestCount,
            advancedTestCount
        ] = await Promise.all([
            Conversation.countDocuments(),
            User.countDocuments({ "role": { $ne: 'admin' } }),
            SimpleTest.countDocuments(),
            AdvancedTest.countDocuments()
        ]);
        res.status(200).json({ conversationCount, usersCount, simpleTestCount, advancedTestCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard counts', error });
    }
};

module.exports = {
    getDashboardCounts,
};
