import { StringSelectMenuInteraction } from 'discord.js';
import logger from '../../utils/logger.js';

// Temporary storage for review selections
const reviewSelections = new Map<string, { serviceType?: string; developer?: string }>();

export default {
  customId: 'reviewServiceSelect',

  async execute(interaction: StringSelectMenuInteraction) {
    try {
      const serviceType = interaction.values[0];
      const userId = interaction.user.id;

      // Store the service type selection
      const currentSelections = reviewSelections.get(userId) || {};
      reviewSelections.set(userId, { ...currentSelections, serviceType });

      await interaction.update({ content: `Service selected: ${serviceType}. Please select a developer.`, components: interaction.message.components });
      
      logger.info(`Service selection stored for user ${userId}: ${serviceType}`);
    } catch (error) {
      logger.error('Error handling service selection:', error);
    }
  }
};

export { reviewSelections };
