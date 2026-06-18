import { ButtonInteraction, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'reviewButton',

  async execute(interaction: ButtonInteraction) {
    try {
      const configService = new ConfigService();
      const developers = await configService.getDevelopers();

      // Create service type select menu
      const serviceSelect = new StringSelectMenuBuilder()
        .setCustomId('reviewServiceSelect')
        .setPlaceholder('Select the service you used')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Discord Bot')
            .setValue('Discord Bot')
            .setDescription('Custom Discord Bot development')
            .setEmoji('🤖'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Webstore')
            .setValue('Webstore')
            .setDescription('Tebex Webstore development')
            .setEmoji('🛒')
        );

      // Create developer select menu
      const developerSelect = new StringSelectMenuBuilder()
        .setCustomId('reviewDeveloperSelect')
        .setPlaceholder('Select the developer');

      developers.forEach(dev => {
        developerSelect.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(dev.name)
            .setValue(dev.name)
            .setDescription(`Review for ${dev.name}`)
        );
      });

      // Create submit button
      const submitButton = new ButtonBuilder()
        .setCustomId('reviewSubmit')
        .setLabel('Create Review')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('✅');

      const firstRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(serviceSelect);
      const secondRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(developerSelect);
      const thirdRow = new ActionRowBuilder<ButtonBuilder>().addComponents(submitButton);

      await interaction.reply({
        content: 'Please select the service and developer, then click "Create Review" to continue.',
        components: [firstRow, secondRow, thirdRow],
        ephemeral: true
      });

      logger.info(`Review selection menu opened by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error opening review selection menu:', error);
      await interaction.reply({
        embeds: [createErrorEmbed('Error', 'Failed to open review selection menu.')],
        ephemeral: true
      });
    }
  }
};
