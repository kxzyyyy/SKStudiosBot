import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-ticket-panel')
    .setDescription('Create a ticket panel with an embed and open ticket button')
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('Title of the ticket panel')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Description of the ticket panel')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('service_1_name')
        .setDescription('Name of first service button (e.g., "Order Discord Bot")')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('service_2_name')
        .setDescription('Name of second service button (e.g., "Order Webstore")')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('service_3_name')
        .setDescription('Name of third service button')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('service_4_name')
        .setDescription('Name of fourth service button')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('service_5_name')
        .setDescription('Name of fifth service button')
        .setRequired(false)
    ),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    try {
      const configService = new ConfigService();
      const config = await configService.getConfig();

      if (!config.ticketPanelChannelId) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Ticket panel channel not configured. Use /setup to configure it first.')]
        });
        return;
      }

      const panelChannel = interaction.guild?.channels.cache.get(config.ticketPanelChannelId);
      
      if (!panelChannel || panelChannel.type !== ChannelType.GuildText) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Panel channel not found or is not a text channel.')]
        });
        return;
      }

      const title = interaction.options.getString('title') || '🎫 Order Services';
      const description = interaction.options.getString('description') || 'Click a button below to order a service.\n\nOur team will get back to you shortly!';

      const serviceNames = [
        interaction.options.getString('service_1_name'),
        interaction.options.getString('service_2_name'),
        interaction.options.getString('service_3_name'),
        interaction.options.getString('service_4_name'),
        interaction.options.getString('service_5_name')
      ].filter(Boolean);

      if (serviceNames.length === 0) {
        await interaction.editReply({
          embeds: [createErrorEmbed('Error', 'Please provide at least one service button name.')]
        });
        return;
      }

      const guild = interaction.guild;
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor('#0099ff')
        .setThumbnail(guild?.iconURL() || null)
        .setFooter({ text: guild?.name || 'Order System' })
        .setTimestamp();

      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      const buttons: ButtonBuilder[] = [];

      serviceNames.forEach((serviceName, index) => {
        const button = new ButtonBuilder()
          .setCustomId(`openTicket_${serviceName}`)
          .setLabel(serviceName)
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫');
        
        buttons.push(button);

        if (buttons.length === 5 || index === serviceNames.length - 1) {
          rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons));
          buttons.length = 0;
        }
      });

      await panelChannel.send({
        embeds: [embed],
        components: rows
      });

      await interaction.editReply({
        embeds: [createSuccessEmbed('Success', `Ticket panel has been created with ${serviceNames.length} service buttons!`)]
      });

      logger.info(`Ticket panel created by ${interaction.user.tag} with services: ${serviceNames.join(', ')}`);
    } catch (error) {
      logger.error('Error creating ticket panel:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('Error', 'Failed to create ticket panel.')]
      });
    }
  }
};
