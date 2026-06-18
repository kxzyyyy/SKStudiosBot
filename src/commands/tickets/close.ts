import { SlashCommandBuilder } from 'discord.js';
import { TicketService } from '../../services/tickets/TicketService.js';
import { TranscriptService } from '../../services/tickets/TranscriptService.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the current ticket'),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const ticketService = new TicketService();
      const transcriptService = new TranscriptService();
      const configService = new ConfigService();

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

      const channel = interaction.channel;
      const transcriptPath = await transcriptService.generateAndSave(channel, ticket.ticketNumber);

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

      await ticketService.closeTicket(interaction.channelId, transcriptPath);

      await interaction.editReply({
        embeds: [createSuccessEmbed('Ticket Closed', `Ticket #${ticket.ticketNumber} has been closed. Transcript saved.`)]
      });

      setTimeout(async () => {
        try {
          await channel.delete();
          await ticketService.deleteTicket(interaction.channelId);
        } catch (error) {
          logger.error('Error deleting ticket channel:', error);
        }
      }, 5000);

      logger.info(`Ticket #${ticket.ticketNumber} closed by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error closing ticket:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to close ticket.')]
      });
    }
  }
};
