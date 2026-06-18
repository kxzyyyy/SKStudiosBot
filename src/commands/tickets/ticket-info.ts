import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { TicketService } from '../../services/tickets/TicketService.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';
import dayjs from 'dayjs';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-info')
    .setDescription('Get information about the current ticket'),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const ticketService = new TicketService();
      const configService = new ConfigService();

      const ticket = await ticketService.getTicketByChannelId(interaction.channelId);
      
      if (!ticket) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'This channel is not a ticket.')]
        });
        return;
      }

      const user = await interaction.client.users.fetch(ticket.userId);
      const guild = interaction.guild;
      const staffRoleId = await configService.getStaffRoleId();
      const staffRole = guild?.roles.cache.get(staffRoleId);

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket #${ticket.ticketNumber}`)
        .setColor(ticket.status === 'open' ? '#00ff00' : ticket.status === 'claimed' ? '#ffcc00' : '#ff0000')
        .addFields(
          { name: 'User', value: `${user.tag} (${ticket.userId})`, inline: true },
          { name: 'Status', value: ticket.status.toUpperCase(), inline: true },
          { name: 'Claimed By', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'None', inline: true },
          { name: 'Opened', value: dayjs(ticket.openTime).format('YYYY-MM-DD HH:mm:ss'), inline: true },
          { name: 'Closed', value: ticket.closeTime ? dayjs(ticket.closeTime).format('YYYY-MM-DD HH:mm:ss') : 'N/A', inline: true }
        )
        .setFooter({ text: `Staff Role: ${staffRole?.name || 'Not configured'}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      logger.info(`Ticket info requested for #${ticket.ticketNumber} by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error getting ticket info:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to get ticket info.')]
      });
    }
  }
};
