import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create and send custom embeds'),

  async execute(interaction: any) {
    try {
      // Create the modal
      const modal = new ModalBuilder()
        .setCustomId('embedModal')
        .setTitle('Create Embed');

      const titleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Title')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(256);

      const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(4000);

      const colorInput = new TextInputBuilder()
        .setCustomId('color')
        .setLabel('Color (Hex code, e.g., #0099ff)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue('#0099ff');

      const thumbnailInput = new TextInputBuilder()
        .setCustomId('thumbnail')
        .setLabel('Thumbnail URL')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const imageInput = new TextInputBuilder()
        .setCustomId('image')
        .setLabel('Image URL')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
      const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);
      const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput);
      const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(thumbnailInput);
      const fifthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput);

      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow,
        fifthActionRow
      );

      await interaction.showModal(modal);

      logger.info(`Embed modal opened by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error opening embed modal:', error);
      await interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to open embed modal.')],
        ephemeral: true
      });
    }
  }
};
