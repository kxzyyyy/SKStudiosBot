import { ButtonInteraction } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'previewSend',

  async execute(interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const message = interaction.message;
      const embed = message.embeds[0];

      if (!embed) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'No embed found to send.')]
        });
        return;
      }

      const channel = interaction.channel;
      if (!channel || !channel.isTextBased()) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Cannot send embed in this channel.')]
        });
        return;
      }

      await channel.send({ embeds: [embed] });

      await message.delete();

      await interaction.editReply({
        embeds: [createSuccessEmbed('Embed Sent', 'Embed has been sent to this channel.')]
      });

      logger.info(`Embed sent to ${channel.name} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error sending embed:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to send embed.')]
      });
    }
  }
};
