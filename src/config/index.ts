import 'dotenv/config';

export const CONFIG = {
  // Discord
  CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
  DEV_GUILD_ID: process.env.DISCORD_DEV_GUILD_ID || '',

  // MongoDB
  MONGO_HOST: process.env.MONGO_HOST || 'mongo',
  MONGO_PORT: process.env.MONGO_PORT || '27017',
  MONGO_DB: process.env.MONGO_DB || 'basilisk',
  MONGO_USER: process.env.MONGO_USER || 'root',
  MONGO_PASS: process.env.MONGO_PASS || 'root',
} as const;
