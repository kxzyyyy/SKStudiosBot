import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import ready from './events/ready.js';
import interactionCreate from './events/interactionCreate.js';
import guildCreate from './events/guildCreate.js';

dotenv.config();

const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User
  ]
});

client.once('ready', () => ready(client));
client.on('interactionCreate', (interaction) => interactionCreate(interaction, client));
client.on('guildCreate', (guild) => guildCreate(guild));

client.on('error', (error) => {
  logger.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

logger.info('Starting bot...');
client.login(process.env.DISCORD_TOKEN);
