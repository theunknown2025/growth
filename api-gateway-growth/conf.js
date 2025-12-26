// SET UP
const dotenv =  require('dotenv');

// CONFIGURATION
dotenv.config({ path: './.env' });

// RETURN
module.exports = {
    db: process.env.MONGODB,
    sessionSecret: process.env.sessionSecret,
    tokenOption: {
        jwtSecret: process.env.jwtSecret,
        jwtExpirationDate: process.env.jwtExpirationDate,
    },
    openaiconfig: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    corsvar: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },
}