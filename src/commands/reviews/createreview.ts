import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('createreview')
    .setDescription('Create a review embed with a button to leave a review'),

  async execute(interaction: any) {
    await interaction.deferReply();

    try {
      const configService = new ConfigService();
      const config = await configService.getConfig();

      if (!config.reviewChannelId) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Review channel not configured. Use /setup-reviews to configure it first.')]
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('⭐ Leave a Review')
        .setDescription('How was your experience with our service?\n\nClick the button below to leave a review!')
        .setColor('#ffcc00')
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('reviewButton')
            .setLabel('Leave Review')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⭐')
        );

      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });

      logger.info(`Review panel created by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error creating review panel:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to create review panel.')]
      });
    }
  }
};
