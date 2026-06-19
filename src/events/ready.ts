import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import logger from '../utils/logger.js';
import { FileManager } from '../storage/FileManager.js';

export default async function ready(client: Client) {
  logger.info(`Logged in as ${client.user?.tag}!`);
  logger.info(`Bot is ready in ${client.guilds.cache.size} guilds`);

  await FileManager.initializeDirectories();
  await FileManager.initializeDataFiles();

  await registerCommands(client);

  logger.info('Bot initialization complete');
}

async function registerCommands(client: Client) {
  const commands = [];

  const commandsPath = join(process.cwd(), 'src', 'commands');
  const commandFolders = readdirSync(commandsPath, { recursive: true }) as string[];

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder);

    const { statSync } = await import('fs');
    try {
      if (!statSync(folderPath).isDirectory()) continue;
    } catch {
      continue;
    }

    const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.ts') && !file.startsWith('.'));

    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      try {
        const command = await import(pathToFileURL(filePath).href);
        if ('data' in command.default && 'execute' in command.default) {
          commands.push(command.default.data.toJSON());
          logger.info(`Loaded command: ${file}`);
        }
      } catch (error) {
        logger.error(`Error loading command ${file}:`, error);
      }
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    const guildId = process.env.GUILD_ID;
    const clientId = process.env.CLIENT_ID;

    if (!guildId || !clientId) {
      throw new Error('GUILD_ID or CLIENT_ID not set in environment variables');
    }

    if (guildId === clientId) {
      throw new Error('GUILD_ID and CLIENT_ID are the same. GUILD_ID must be your Discord server ID, not the bot application ID. Please update your .env file.');
    }

    await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
    );

    logger.info(`Successfully reloaded ${commands.length} application (/) commands.`);
  } catch (error: any) {
    if (error?.code === 50001) {
      logger.error('Missing Access: The bot lacks the "applications.commands" OAuth2 scope. Re-invite the bot with both "bot" and "applications.commands" scopes from the Discord Developer Portal.');
    } else {
      logger.error('Error registering commands:', error);
    }
  }
}
