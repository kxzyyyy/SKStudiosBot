import { SlashCommandBuilder } from 'discord.js';
import { TicketService } from '../../services/tickets/TicketService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim the current ticket'),

  async execute(interaction: any) {
    // Check if user has staff permissions
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const ticketService = new TicketService();

      // Get the ticket
      const ticket = await ticketService.getTicketByChannelId(interaction.channelId);
      
      if (!ticket) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'This channel is not a ticket.')]
        });
        return;
      }

      if (ticket.status === 'closed') {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'This ticket is already closed.')]
        });
        return;
      }

      if (ticket.status === 'claimed' && ticket.claimedBy !== interaction.user.id) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'This ticket is already claimed by another staff member.')]
        });
        return;
      }

      if (ticket.status === 'claimed' && ticket.claimedBy === interaction.user.id) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'You have already claimed this ticket.')]
        });
        return;
      }

      // Claim the ticket
      await ticketService.claimTicket(interaction.channelId, interaction.user.id);

      await interaction.editReply({
        embeds: [createSuccessEmbed('Ticket Claimed', `Ticket #${ticket.ticketNumber} has been claimed by ${interaction.user.tag}`)]
      });

      logger.info(`Ticket #${ticket.ticketNumber} claimed by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error claiming ticket:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to claim ticket.')]
      });
    }
  }
};
