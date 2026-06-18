import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'previewEdit',

  async execute(interaction: ButtonInteraction) {
    try {
      const message = interaction.message;
      const embed = message.embeds[0];

      if (!embed) {
        await interaction.reply({
          embeds: [createErrorEmbed('Error', 'No embed found to edit.')],
          ephemeral: true
        });
        return;
      }

      const modal = new ModalBuilder()
        .setCustomId('embedModal')
        .setTitle('Edit Embed');

      const titleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Title')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(embed.title || '')
        .setMaxLength(256);

      const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setValue(embed.description || '')
        .setMaxLength(4000);

      const colorInput = new TextInputBuilder()
        .setCustomId('color')
        .setLabel('Color (Hex code, e.g., #0099ff)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#0099ff');

      const thumbnailInput = new TextInputBuilder()
        .setCustomId('thumbnail')
        .setLabel('Thumbnail URL')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(embed.thumbnail?.url || '');

      const imageInput = new TextInputBuilder()
        .setCustomId('image')
        .setLabel('Image URL')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setValue(embed.image?.url || '');

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

      logger.info(`Embed edit modal opened by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error opening embed edit modal:', error);
      await interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to open edit modal.')],
        ephemeral: true
      });
    }
  }
};
