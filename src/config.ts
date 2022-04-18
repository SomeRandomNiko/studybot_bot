import dotenv from 'dotenv';
dotenv.config();

export default {
    mongodbURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/studybot',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtExpiration: process.env.JWT_EXPIRATION || '1h',
    frontendServerUri: process.env.FRONTEND_SERVER_URI || 'http://localhost:4200',
    authServerUri: process.env.AUTH_SERVER_URI || 'http://localhost:8081',
    discordBotToken: process.env.DISCORD_BOT_TOKEN || '',
}