import { GuildMember, PartialGuildMember, EmbedBuilder } from 'discord.js';
import { ConfigService } from '../services/config/ConfigService.js';
import { replacePlaceholders } from '../utils/placeholders.js';
import logger from '../utils/logger.js';

const DEFAULT_LEAVE_TITLE = 'Goodbye!';
const DEFAULT_LEAVE_MESSAGE = '**{username}** has left **{server_name}**. We\'re sorry to see you go!';
const DEFAULT_LEAVE_COLOR = '#ff0000';

export default async function guildMemberRemove(member: GuildMember | PartialGuildMember) {
  if (member.partial) return;

  logger.info(`Member left: ${member.user.tag} (ID: ${member.id})`);

  try {
    const configService = new ConfigService();
    const config = await configService.getConfig();

    if (config.leaveChannelId) {
      const channel = member.guild.channels.cache.get(config.leaveChannelId);
      if (channel && channel.isTextBased()) {
        const title = replacePlaceholders(config.leaveTitle || DEFAULT_LEAVE_TITLE, member);
        const message = replacePlaceholders(config.leaveMessage || DEFAULT_LEAVE_MESSAGE, member);
        const color = config.leaveColor || DEFAULT_LEAVE_COLOR;

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(message)
          .setColor(color as any)
          .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
          .setTimestamp();

        if (config.leaveFooterImage) {
          embed.setImage(config.leaveFooterImage);
        }

        embed.setFooter({ text: `ID: ${member.id}` });

        try {
          await channel.send({ embeds: [embed] });
          logger.info(`Leave message sent for ${member.user.tag} in channel ${channel.id}`);
        } catch (error) {
          logger.error(`Failed to send leave message for ${member.user.tag}:`, error);
        }
      } else {
        logger.warn(`Leave channel ID ${config.leaveChannelId} not found or not text-based in guild ${member.guild.name}`);
      }
    }
  } catch (error) {
    logger.error('Error in guildMemberRemove handler:', error);
  }
}
