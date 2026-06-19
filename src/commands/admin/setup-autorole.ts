import { SlashCommandBuilder } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed, createInfoEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-autorole')
    .setDescription('Set the role automatically given to new members')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Role to assign to new members (leave empty to disable)')
        .setRequired(false)
    ),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const role = interaction.options.getRole('role');
      const configService = new ConfigService();

      if (!role) {
        await configService.updateConfig({ autoroleId: '' });

        await interaction.editReply({
          embeds: [createInfoEmbed('Autorole Disabled', 'Autorole has been disabled. New members will no longer receive a role automatically.')]
        });

        logger.info(`Autorole disabled by ${interaction.user.tag}`);
        return;
      }

      await configService.updateConfig({ autoroleId: role.id });

      await interaction.editReply({
        embeds: [createSuccessEmbed('Autorole Set', `New members will automatically receive the ${role} role.`)]
      });

      logger.info(`Autorole set to ${role.id} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error setting autorole:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to set autorole.')]
      });
    }
  }
};
