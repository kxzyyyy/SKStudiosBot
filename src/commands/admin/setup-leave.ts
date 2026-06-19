import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed, createInfoEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-leave')
    .setDescription('Set the channel for leave messages')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel for leave messages (leave empty to disable)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const channel = interaction.options.getChannel('channel');
      const configService = new ConfigService();

      if (!channel) {
        await configService.updateConfig({ leaveChannelId: '' });

        await interaction.editReply({
          embeds: [createInfoEmbed('Leave Messages Disabled', 'Leave messages have been disabled.')]
        });

        logger.info(`Leave messages disabled by ${interaction.user.tag}`);
        return;
      }

      await configService.updateConfig({ leaveChannelId: channel.id });

      await interaction.editReply({
        embeds: [createSuccessEmbed('Leave Channel Set', `Leave messages will be sent to ${channel}.`)]
      });

      logger.info(`Leave channel set to ${channel.id} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting leave channel:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to set leave channel.')]
      });
    }
  }
};
