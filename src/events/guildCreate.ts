import { Guild } from 'discord.js';
import logger from '../utils/logger.js';

/**
 * Guild create event handler
 * Called when the bot joins a new guild
 */
export default async function guildCreate(guild: Guild) {
  logger.info(`Bot joined guild: ${guild.name} (ID: ${guild.id})`);
  logger.info(`Guild has ${guild.memberCount} members`);
}
