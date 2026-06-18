import { ButtonInteraction, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { TicketService } from '../../services/tickets/TicketService.js';
import { TicketNumberService } from '../../services/tickets/TicketNumberService.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  customId: 'openTicket',

  async execute(interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const ticketService = new TicketService();
      const ticketNumberService = new TicketNumberService();
      const configService = new ConfigService();

      const openTickets = await ticketService.getUserOpenTickets(interaction.user.id);
      if (openTickets.length > 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'You already have an open ticket. Please close it before creating a new one.')]
        });
        return;
      }

      const ticketCategoryId = await configService.getTicketCategoryId();
      const staffRoleId = await configService.getStaffRoleId();

      if (!ticketCategoryId) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Ticket category not configured. Please contact staff.')]
        });
        return;
      }

      const ticketNumber = await ticketNumberService.getCurrentTicketNumber() + 1;
      const formattedNumber = ticketNumberService.formatTicketNumber(ticketNumber);

      const channelName = `${interaction.user.username}-${formattedNumber}`;
      const ticketChannel = await interaction.guild?.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketCategoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          },
          {
            id: interaction.client.user!.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          },
          {
            id: staffRoleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          }
        ]
      });

      if (!ticketChannel) {
        throw new Error('Failed to create ticket channel');
      }

      const serviceType = interaction.customId.startsWith('openTicket_') 
        ? interaction.customId.replace('openTicket_', '')
        : undefined;

      await ticketService.createTicket(interaction.user.id, ticketChannel.id, serviceType);

      const serviceInfo = serviceType ? `\n**Service:** ${serviceType}` : '';
      const embed = createSuccessEmbed(
        `🎫 Ticket #${formattedNumber}`,
        `Welcome to your ticket, ${interaction.user}!\n\n ${serviceInfo}\n\nPlease refer to <#1516551403919642725> and disclose your project details below.`
      );

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('claimTicket')
            .setLabel('Claim Ticket')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅'),
          new ButtonBuilder()
            .setCustomId('closeTicket')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
        );

      await ticketChannel.send({
        content: `<@${interaction.user.id}> <@&${staffRoleId}>`,
        embeds: [embed],
        components: [row]
      });

      await interaction.editReply({
        embeds: [createSuccessEmbed('Ticket Created', `Your ticket has been created: ${ticketChannel}`)]
      });

      logger.info(`Ticket #${formattedNumber} opened by ${interaction.user.tag}`);
    } catch (error) {
      logger.error('Error opening ticket:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to open ticket. Please contact staff.')]
      });
    }
  }
};
