import { GuildMember, EmbedBuilder } from 'discord.js';
import { ConfigService } from '../services/config/ConfigService.js';
import { replacePlaceholders } from '../utils/placeholders.js';
import logger from '../utils/logger.js';

const DEFAULT_WELCOME_TITLE = 'Welcome!';
const DEFAULT_WELCOME_MESSAGE = 'Welcome to **{server_name}**, {mention_user}! We\'re glad to have you here.';
const DEFAULT_WELCOME_COLOR = '#00ff00';

export default async function guildMemberAdd(member: GuildMember) {
  logger.info(`New member joined: ${member.user.tag} (ID: ${member.id})`);

  try {
    const configService = new ConfigService();
    const config = await configService.getConfig();

    // Autorole
    if (config.autoroleId) {
      const role = member.guild.roles.cache.get(config.autoroleId);
      if (role) {
        try {
          await member.roles.add(role);
          logger.info(`Autorole assigned: ${role.name} to ${member.user.tag}`);
        } catch (error) {
          logger.error(`Failed to assign autorole to ${member.user.tag}:`, error);
        }
      } else {
        logger.warn(`Autorole ID ${config.autoroleId} not found in guild ${member.guild.name}`);
      }
    }

    // Welcome message
    if (config.welcomeChannelId) {
      const channel = member.guild.channels.cache.get(config.welcomeChannelId);
      if (channel && channel.isTextBased()) {
        const title = replacePlaceholders(config.welcomeTitle || DEFAULT_WELCOME_TITLE, member);
        const message = replacePlaceholders(config.welcomeMessage || DEFAULT_WELCOME_MESSAGE, member);
        const color = config.welcomeColor || DEFAULT_WELCOME_COLOR;

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(message)
          .setColor(color as any)
          .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
          .setTimestamp();

        if (config.welcomeFooterImage) {
          embed.setImage(config.welcomeFooterImage);
        }

        embed.setFooter({ text: `ID: ${member.id}` });

        try {
          await channel.send({ embeds: [embed] });
          logger.info(`Welcome message sent for ${member.user.tag} in channel ${channel.id}`);
        } catch (error) {
          logger.error(`Failed to send welcome message for ${member.user.tag}:`, error);
        }
      } else {
        logger.warn(`Welcome channel ID ${config.welcomeChannelId} not found or not text-based in guild ${member.guild.name}`);
      }
    }
  } catch (error) {
    logger.error('Error in guildMemberAdd handler:', error);
  }
}
