import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { validateChannelId, validateRoleId } from '../../utils/validation.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure bot settings')
    .addChannelOption(option =>
      option
        .setName('ticket_category')
        .setDescription('Category for ticket channels')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName('transcript_channel')
        .setDescription('Channel for ticket transcripts')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName('review_channel')
        .setDescription('Channel for reviews')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addRoleOption(option =>
      option
        .setName('staff_role')
        .setDescription('Role for staff members')
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName('ticket_panel_channel')
        .setDescription('Channel for ticket panel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName('closed_ticket_category')
        .setDescription('Category for closed tickets (leave empty to delete closed tickets)')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(false)
    ),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const configService = new ConfigService();
      const updates: any = {};

      const ticketCategory = interaction.options.getChannel('ticket_category');
      const transcriptChannel = interaction.options.getChannel('transcript_channel');
      const reviewChannel = interaction.options.getChannel('review_channel');
      const staffRole = interaction.options.getRole('staff_role');
      const ticketPanelChannel = interaction.options.getChannel('ticket_panel_channel');
      const closedTicketCategory = interaction.options.getChannel('closed_ticket_category');

      if (ticketCategory) {
        updates.ticketCategoryId = ticketCategory.id;
      }
      if (transcriptChannel) {
        updates.transcriptChannelId = transcriptChannel.id;
      }
      if (reviewChannel) {
        updates.reviewChannelId = reviewChannel.id;
      }
      if (staffRole) {
        updates.staffRoleId = staffRole.id;
      }
      if (ticketPanelChannel) {
        updates.ticketPanelChannelId = ticketPanelChannel.id;
      }
      if (closedTicketCategory) {
        updates.closedTicketCategoryId = closedTicketCategory.id;
      }

      if (Object.keys(updates).length === 0) {
        // Show current configuration
        const config = await configService.getConfig();
        const embed = {
          title: '⚙️ Current Configuration',
          color: 0x0099ff,
          fields: [
            { name: 'Ticket Category', value: config.ticketCategoryId || 'Not set', inline: true },
            { name: 'Transcript Channel', value: config.transcriptChannelId || 'Not set', inline: true },
            { name: 'Review Channel', value: config.reviewChannelId || 'Not set', inline: true },
            { name: 'Staff Role', value: config.staffRoleId || 'Not set', inline: true },
            { name: 'Ticket Panel Channel', value: config.ticketPanelChannelId || 'Not set', inline: true },
            { name: 'Closed Ticket Category', value: config.closedTicketCategoryId || 'Not set (tickets will be deleted)', inline: true }
          ],
          timestamp: new Date().toISOString()
        };

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      await configService.updateConfig(updates);

      await interaction.editReply({
        embeds: [createSuccessEmbed('Configuration Updated', 'Bot settings have been updated successfully.')]
      });

      logger.info(`Configuration updated by ${interaction.user.tag}:`, updates);
    } catch (error) {
      logger.error('Error updating configuration:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to update configuration.')]
      });
    }
  }
};
