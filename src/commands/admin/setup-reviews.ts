import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-reviews')
    .setDescription('Set the review channel')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel for reviews')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const channel = interaction.options.getChannel('channel');
      const configService = new ConfigService();

      await configService.updateConfig({ reviewChannelId: channel.id });

      await interaction.editReply({
        embeds: [createSuccessEmbed('Review Channel Set', `Reviews will be sent to ${channel}`)]
      });

      logger.info(`Review channel set to ${channel.id} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting review channel:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to set review channel.')]
      });
    }
  }
};
