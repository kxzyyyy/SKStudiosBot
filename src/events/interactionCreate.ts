import { Client, Interaction, ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';
import logger from '../utils/logger.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

/**
 * Interaction create event handler
 * Handles all interactions (slash commands, buttons, modals, select menus)
 */
export default async function interactionCreate(interaction: Interaction, client: Client) {
  try {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction, client);
    }
    // Handle button interactions
    else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
    // Handle modal submissions
    else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    }
    // Handle select menu interactions
    else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    }
  } catch (error) {
    logger.error('Error handling interaction:', error);
    
    // Reply to user if interaction hasn't been replied to yet
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: 'An error occurred while processing your request.',
          ephemeral: true
        });
      } catch {
        // Ignore if we can't reply
      }
    }
  }
}

/**
 * Handle slash commands
 */
async function handleSlashCommand(interaction: any, client: Client) {
  const commandName = interaction.commandName;
  
  try {
    // Find and execute the command
    const command = await loadCommand(commandName);
    
    if (!command) {
      logger.warn(`Command not found: ${commandName}`);
      await interaction.reply({
        content: 'Command not found.',
        ephemeral: true
      });
      return;
    }

    logger.info(`Executing command: ${commandName} by ${interaction.user.tag}`);
    await command.execute(interaction, client);
  } catch (error) {
    logger.error(`Error executing command ${commandName}:`, error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error executing this command.',
        ephemeral: true
      });
    }
  }
}

/**
 * Handle button interactions
 */
async function handleButtonInteraction(interaction: ButtonInteraction) {
  const customId = interaction.customId;
  
  try {
    // Find and execute the button handler
    const handler = await loadButtonHandler(customId);
    
    if (!handler) {
      logger.warn(`Button handler not found: ${customId}`);
      await interaction.reply({
        content: 'Button action not found.',
        ephemeral: true
      });
      return;
    }

    logger.info(`Executing button handler: ${customId} by ${interaction.user.tag}`);
    await handler.execute(interaction);
  } catch (error) {
    logger.error(`Error executing button handler ${customId}:`, error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error processing this action.',
        ephemeral: true
      });
    }
  }
}

/**
 * Handle modal submissions
 */
async function handleModalSubmit(interaction: ModalSubmitInteraction) {
  const customId = interaction.customId;
  
  try {
    // Find and execute the modal handler
    const handler = await loadModalHandler(customId);
    
    if (!handler) {
      logger.warn(`Modal handler not found: ${customId}`);
      await interaction.reply({
        content: 'Modal action not found.',
        ephemeral: true
      });
      return;
    }

    logger.info(`Executing modal handler: ${customId} by ${interaction.user.tag}`);
    await handler.execute(interaction);
  } catch (error) {
    logger.error(`Error executing modal handler ${customId}:`, error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error processing this submission.',
        ephemeral: true
      });
    }
  }
}

/**
 * Handle select menu interactions
 */
async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  const customId = interaction.customId;
  
  try {
    // Find and execute the select menu handler
    const handler = await loadSelectMenuHandler(customId);
    
    if (!handler) {
      logger.warn(`Select menu handler not found: ${customId}`);
      await interaction.reply({
        content: 'Select menu action not found.',
        ephemeral: true
      });
      return;
    }

    logger.info(`Executing select menu handler: ${customId} by ${interaction.user.tag}`);
    await handler.execute(interaction);
  } catch (error) {
    logger.error(`Error executing select menu handler ${customId}:`, error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error processing this selection.',
        ephemeral: true
      });
    }
  }
}

/**
 * Load a command by name
 */
async function loadCommand(commandName: string) {
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
        if (command.default?.data?.name === commandName) {
          return command.default;
        }
      } catch {
        continue;
      }
    }
  }
  
  return null;
}

/**
 * Load a button handler by custom ID
 */
async function loadButtonHandler(customId: string) {
  const buttonsPath = join(process.cwd(), 'src', 'interactions', 'buttons');
  const buttonFiles = readdirSync(buttonsPath).filter(file => file.endsWith('.ts') && !file.startsWith('.'));
  
  for (const file of buttonFiles) {
    const filePath = join(buttonsPath, file);
    try {
      const handler = await import(pathToFileURL(filePath).href);
      if (handler.default?.customId === customId || customId.startsWith(handler.default?.customId || '')) {
        return handler.default;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

/**
 * Load a modal handler by custom ID
 */
async function loadModalHandler(customId: string) {
  const modalsPath = join(process.cwd(), 'src', 'interactions', 'modals');
  const modalFiles = readdirSync(modalsPath).filter(file => file.endsWith('.ts') && !file.startsWith('.'));
  
  for (const file of modalFiles) {
    const filePath = join(modalsPath, file);
    try {
      const handler = await import(pathToFileURL(filePath).href);
      if (handler.default?.customId === customId || customId.startsWith(handler.default?.customId || '')) {
        return handler.default;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

/**
 * Load a select menu handler by custom ID
 */
async function loadSelectMenuHandler(customId: string) {
  const selectMenusPath = join(process.cwd(), 'src', 'interactions', 'selectmenus');
  const selectMenuFiles = readdirSync(selectMenusPath).filter(file => file.endsWith('.ts') && !file.startsWith('.'));
  
  for (const file of selectMenuFiles) {
    const filePath = join(selectMenusPath, file);
    try {
      const handler = await import(pathToFileURL(filePath).href);
      if (handler.default?.customId === customId || customId.startsWith(handler.default?.customId || '')) {
        return handler.default;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}
