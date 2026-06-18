import { SlashCommandBuilder } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Set the staff role')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Role for staff members')
        .setRequired(true)
    ),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const role = interaction.options.getRole('role');
      const configService = new ConfigService();

      await configService.updateConfig({ staffRoleId: role.id });

      await interaction.editReply({
        embeds: [createSuccessEmbed('Staff Role Set', `Staff role set to ${role}`)]
      });

      logger.info(`Staff role set to ${role.id} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting staff role:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to set staff role.')]
      });
    }
  }
};
