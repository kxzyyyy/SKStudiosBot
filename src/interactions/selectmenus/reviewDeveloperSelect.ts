import { StringSelectMenuInteraction } from 'discord.js';
import logger from '../../utils/logger.js';
import { reviewSelections } from './reviewServiceSelect.js';

export default {
  customId: 'reviewDeveloperSelect',

  async execute(interaction: StringSelectMenuInteraction) {
    try {
      const developer = interaction.values[0];
      const userId = interaction.user.id;

      const currentSelections = reviewSelections.get(userId) || {};
      reviewSelections.set(userId, { ...currentSelections, developer });

      await interaction.update({ content: `Developer selected: ${developer}. Click "Create Review" to continue.`, components: interaction.message.components });
      
      logger.info(`Developer selection stored for user ${userId}: ${developer}`);
    } catch (error) {
      logger.error('Error handling developer selection:', error);
    }
  }
};
