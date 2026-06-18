import { ModalSubmitInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EmbedService } from '../../services/embeds/EmbedService.js';
import { validateUrl } from '../../utils/validation.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

const embedDataStore = new Map<string, any>();

export default {
  customId: 'embedModal',

  async execute(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const title = interaction.fields.getTextInputValue('title');
      const description = interaction.fields.getTextInputValue('description');
      const color = interaction.fields.getTextInputValue('color');
      const thumbnail = interaction.fields.getTextInputValue('thumbnail');
      const image = interaction.fields.getTextInputValue('image');

      if (thumbnail && !validateUrl(thumbnail)) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Invalid thumbnail URL.')]
        });
        return;
      }

      if (image && !validateUrl(image)) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Invalid image URL.')]
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color as any)
        .setTimestamp();

      if (thumbnail) embed.setThumbnail(thumbnail);
      if (image) embed.setImage(image);

      const embedId = Date.now().toString();
      embedDataStore.set(embedId, {
        title,
        description,
        color,
        thumbnail,
        image
      });

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`previewEdit_${embedId}`)
            .setLabel('Edit')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('✏️'),
          new ButtonBuilder()
            .setCustomId(`previewSend_${embedId}`)
            .setLabel('Send')
            .setStyle(ButtonStyle.Success)
            .setEmoji('📤'),
          new ButtonBuilder()
            .setCustomId('previewCancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌')
        );

      await interaction.editReply({
        content: 'Embed Preview:',
        embeds: [embed],
        components: [row]
      });

      logger.info(`Embed preview shown to ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error showing embed preview:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to create embed preview.')]
      });
    }
  }
};

export { embedDataStore };
