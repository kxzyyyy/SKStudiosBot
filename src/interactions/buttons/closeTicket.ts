import { ButtonInteraction, GuildMember } from 'discord.js';
import { TicketService } from '../../services/tickets/TicketService.js';
import { TranscriptService } from '../../services/tickets/TranscriptService.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { canManageTickets } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'closeTicket',

  async execute(interaction: ButtonInteraction) {
    // Check if user has staff permissions
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
        embeds: [createErrorEmbed('Error', 'Only staff can close tickets.')],
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      const ticketService = new TicketService();
      const transcriptService = new TranscriptService();
      const configService = new ConfigService();

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

      // Generate transcript (optional - don't fail if it errors)
      const channel = interaction.channel;
      let transcriptPath: string | null = null;
      
      try {
        transcriptPath = await transcriptService.generateAndSave(channel, ticket.ticketNumber);

        // Get transcript archive channel
        const transcriptChannelId = await configService.getTranscriptChannelId();
        const transcriptChannel = interaction.guild?.channels.cache.get(transcriptChannelId);

        if (transcriptChannel && transcriptChannel.isTextBased()) {
          const transcriptBuffer = await transcriptService.generateTranscript(channel);
          await transcriptService.sendToArchiveChannel(
            transcriptBuffer,
            transcriptChannel,
            ticket.ticketNumber,
            ticket.userId,
            interaction.user.tag,
            ticket.openTime,
            new Date().toISOString()
          );
        }
      } catch (transcriptError) {
        logger.warn(`Transcript generation failed for ticket #${ticket.ticketNumber}, closing without transcript:`, transcriptError);
        transcriptPath = null;
      }

      // Close the ticket
      await ticketService.closeTicket(interaction.channelId, transcriptPath);

      const closeMessage = transcriptPath 
        ? `Ticket #${ticket.ticketNumber} has been closed. Transcript saved.`
        : `Ticket #${ticket.ticketNumber} has been closed. (Transcript generation failed)`;

      await interaction.editReply({
        embeds: [createSuccessEmbed('Ticket Closed', closeMessage)]
      });

      // Move to closed category or delete channel
      const closedTicketCategoryId = await configService.getClosedTicketCategoryId();
      
      if (closedTicketCategoryId) {
        // Move to closed category and remove user access
        setTimeout(async () => {
          try {
            const closedCategory = interaction.guild?.channels.cache.get(closedTicketCategoryId);
            if (closedCategory && channel) {
              await channel.setParent(closedTicketCategoryId);
              // Remove user's access, keep staff and bot
              const staffRoleId = await configService.getStaffRoleId();
              await channel.permissionOverwrites.edit(ticket.userId, { ViewChannel: false });
              await channel.permissionOverwrites.edit(staffRoleId, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
              await channel.setName(`closed-${ticket.ticketNumber}-${channel.name}`);
              logger.info(`Ticket #${ticket.ticketNumber} moved to closed category`);
            }
          } catch (error) {
            logger.error('Error moving ticket to closed category:', error);
          }
        }, 2000);
      } else {
        // Delete the channel after a short delay
        setTimeout(async () => {
          try {
            await channel.delete();
            await ticketService.deleteTicket(interaction.channelId);
          } catch (error) {
            logger.error('Error deleting ticket channel:', error);
          }
        }, 5000);
      }

      logger.info(`Ticket #${ticket.ticketNumber} closed by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error closing ticket:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to close ticket.')]
      });
    }
  }
};
