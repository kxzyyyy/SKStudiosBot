import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-transcripts')
    .setDescription('Set the transcript archive channel')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel for ticket transcripts')
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

      await configService.updateConfig({ transcriptChannelId: channel.id });

      await interaction.editReply({
        embeds: [createSuccessEmbed('Transcript Channel Set', `Transcripts will be sent to ${channel}`)]
      });

      logger.info(`Transcript channel set to ${channel.id} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting transcript channel:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to set transcript channel.')]
      });
    }
  }
};
