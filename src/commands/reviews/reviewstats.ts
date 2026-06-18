import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ReviewService } from '../../services/reviews/ReviewService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reviewstats')
    .setDescription('View review statistics'),

  async execute(interaction: any) {
    // Check if user has staff permissions
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const reviewService = new ReviewService();
      const stats = await reviewService.getReviewStats();

      // Create stats embed
      const embed = new EmbedBuilder()
        .setTitle('📊 Review Statistics')
        .setColor('#0099ff')
        .addFields(
          { name: 'Total Reviews', value: stats.totalReviews.toString(), inline: true },
          { name: 'Average Rating', value: stats.averageRating > 0 ? `${stats.averageRating}/5 ⭐` : 'N/A', inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '⭐ (5 Stars)', value: stats.ratingDistribution[5].toString(), inline: true },
          { name: '⭐⭐ (4 Stars)', value: stats.ratingDistribution[4].toString(), inline: true },
          { name: '⭐⭐⭐ (3 Stars)', value: stats.ratingDistribution[3].toString(), inline: true },
          { name: '⭐⭐⭐⭐ (2 Stars)', value: stats.ratingDistribution[2].toString(), inline: true },
          { name: '⭐⭐⭐⭐⭐ (1 Star)', value: stats.ratingDistribution[1].toString(), inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      logger.info(`Review stats requested by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error getting review stats:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to get review stats.')]
      });
    }
  }
};
