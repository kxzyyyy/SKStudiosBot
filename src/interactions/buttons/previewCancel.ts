import { ButtonInteraction } from 'discord.js';
import { createSuccessEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'previewCancel',

  async execute(interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      await interaction.message.delete();

      await interaction.editReply({
        embeds: [createSuccessEmbed('Cancelled', 'Embed preview cancelled.')]
      });

      logger.info(`Embed preview cancelled by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error cancelling preview:', error);
      await interaction.editReply({
        content: 'Failed to cancel preview.',
        ephemeral: true
      });
    }
  }
};
