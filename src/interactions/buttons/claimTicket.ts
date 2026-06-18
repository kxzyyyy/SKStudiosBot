import { ButtonInteraction, GuildMember } from 'discord.js';
import { TicketService } from '../../services/tickets/TicketService.js';
import { canManageTickets } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'claimTicket',

  async execute(interaction: ButtonInteraction) {
    if (!interaction.member || !(interaction.member instanceof GuildMember)) {
      await interaction.reply({
        embeds: [createErrorEmbed('Error', 'This action can only be used in a server.')],
        ephemeral: true
      });
      return;
    }

    const hasPermission = await canManageTickets(interaction.member);
    if (!hasPermission) {
      await interaction.reply({
        embeds: [createErrorEmbed('Error', 'Only staff can claim tickets.')],
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      const ticketService = new TicketService();

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
