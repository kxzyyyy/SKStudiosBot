import { ModalSubmitInteraction, EmbedBuilder } from 'discord.js';
import { ReviewService } from '../../services/reviews/ReviewService.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { validateRating, validateReviewText } from '../../utils/validation.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'reviewModal',

  async execute(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const rating = interaction.fields.getTextInputValue('rating');
      const review = interaction.fields.getTextInputValue('review');
      const serviceType = interaction.fields.getTextInputValue('serviceType');
      const developer = interaction.fields.getTextInputValue('developer');

      const ratingNum = parseInt(rating);
      if (!validateRating(ratingNum)) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Rating must be a number between 1 and 5.')]
        });
        return;
      }

      if (!validateReviewText(review)) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Review must be between 10 and 1000 characters.')]
        });
        return;
      }

      const reviewService = new ReviewService();
      await reviewService.createReview(
        interaction.user.id,
        interaction.user.tag,
        ratingNum,
        review,
        serviceType || undefined,
        developer || undefined
      );

      const configService = new ConfigService();
      const reviewChannelId = await configService.getReviewChannelId();
      const developers = await configService.getDevelopers();
      const reviewChannel = interaction.guild?.channels.cache.get(reviewChannelId);

      let developerMention = '';
      if (developer) {
        const devInfo = developers.find(d => d.name === developer);
        if (devInfo) {
          developerMention = `<@${devInfo.id}>`;
        }
      }

      if (reviewChannel && reviewChannel.isTextBased()) {
        const stars = '⭐'.repeat(ratingNum);
        const serviceInfo = serviceType ? `\n**Service:** ${serviceType}` : '';
        const developerInfo = developer ? `\n**Developer:** ${developerMention || developer}` : '';
        const reviewEmbed = new EmbedBuilder()
          .setTitle(`${stars} New Review`)
          .setDescription(review + serviceInfo + developerInfo)
          .setColor('#ffcc00')
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
          })
          .setFooter({ text: `Rating: ${ratingNum}/5` })
          .setTimestamp();

        await reviewChannel.send({ embeds: [reviewEmbed] });
      }

      await interaction.editReply({
        embeds: [createSuccessEmbed('Review Submitted', 'Thank you for your review!')]
      });

      logger.info(`Review submitted by ${interaction.user.tag} with rating ${ratingNum} for service: ${serviceType || 'none'}, developer: ${developer || 'none'}`);
    } catch (error) {
      logger.error('Error submitting review:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to submit review.')]
      });
    }
  }
};
