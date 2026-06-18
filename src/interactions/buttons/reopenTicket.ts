import { ButtonInteraction, GuildMember } from 'discord.js';
import { TicketService } from '../../services/tickets/TicketService.js';
import { canManageTickets } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'reopenTicket',

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
        embeds: [createErrorEmbed('Error', 'Only staff can reopen tickets.')],
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

      if (ticket.status !== 'closed') {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'This ticket is not closed.')]
        });
        return;
      }

      await ticketService.reopenTicket(interaction.channelId);

      await interaction.editReply({
        embeds: [createSuccessEmbed('Ticket Reopened', `Ticket #${ticket.ticketNumber} has been reopened.`)]
      });

      logger.info(`Ticket #${ticket.ticketNumber} reopened by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error reopening ticket:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to reopen ticket.')]
      });
    }
  }
};
