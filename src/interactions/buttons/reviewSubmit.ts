import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';
import { reviewSelections } from '../selectmenus/reviewServiceSelect.js';

export default {
  customId: 'reviewSubmit',

  async execute(interaction: ButtonInteraction) {
    try {
      const userId = interaction.user.id;
      
      // Get the selected values from the temporary storage
      const selections = reviewSelections.get(userId);
      const serviceType = selections?.serviceType;
      const developer = selections?.developer;

      // Validate that both service and developer are selected
      if (!serviceType) {
        await interaction.reply({
          embeds: [createErrorEmbed('Error', 'Please select a service type.')],
          ephemeral: true
        });
        return;
      }

      if (!developer) {
        await interaction.reply({
          embeds: [createErrorEmbed('Error', 'Please select a developer.')],
          ephemeral: true
        });
        return;
      }

      // Clear the selections after use
      reviewSelections.delete(userId);

      // Create the review modal with pre-filled values
      const modal = new ModalBuilder()
        .setCustomId('reviewModal')
        .setTitle('Leave a Review');

      const ratingInput = new TextInputBuilder()
        .setCustomId('rating')
        .setLabel('Rating (1-5)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Enter a number between 1 and 5')
        .setMaxLength(1);

      const reviewInput = new TextInputBuilder()
        .setCustomId('review')
        .setLabel('Your Review')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder('Tell us about your experience (minimum 10 characters)')
        .setMinLength(10)
        .setMaxLength(1000);

      const serviceTypeInput = new TextInputBuilder()
        .setCustomId('serviceType')
        .setLabel('Service Type')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(serviceType)
        .setMaxLength(50);

      const developerInput = new TextInputBuilder()
        .setCustomId('developer')
        .setLabel('Developer')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(developer)
        .setMaxLength(50);

      const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(ratingInput);
      const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reviewInput);
      const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(serviceTypeInput);
      const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(developerInput);

      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

      await interaction.showModal(modal);

      logger.info(`Review modal opened by ${interaction.user.tag} for service: ${serviceType}, developer: ${developer}`);
    } catch (error) {
      logger.error('Error opening review modal:', error);
      await interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to open review modal.')],
        ephemeral: true
      });
    }
  }
};
