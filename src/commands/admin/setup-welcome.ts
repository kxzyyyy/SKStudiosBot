import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed, createInfoEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-welcome')
    .setDescription('Set the channel for welcome messages')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel for welcome messages (leave empty to disable)')
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
        await configService.updateConfig({ welcomeChannelId: '' });

        await interaction.editReply({
          embeds: [createInfoEmbed('Welcome Messages Disabled', 'Welcome messages have been disabled.')]
        });

        logger.info(`Welcome messages disabled by ${interaction.user.tag}`);
        return;
      }

      await configService.updateConfig({ welcomeChannelId: channel.id });

      await interaction.editReply({
        embeds: [createSuccessEmbed('Welcome Channel Set', `Welcome messages will be sent to ${channel}.`)]
      });

      logger.info(`Welcome channel set to ${channel.id} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting welcome channel:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to set welcome channel.')]
      });
    }
  }
};
