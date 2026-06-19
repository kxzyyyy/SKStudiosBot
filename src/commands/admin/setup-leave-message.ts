import { SlashCommandBuilder, EmbedBuilder, ColorResolvable } from 'discord.js';
import { ConfigService } from '../../services/config/ConfigService.js';
import { requireStaff } from '../../utils/permissions.js';
import { PLACEHOLDER_GUIDE, validateUrl } from '../../utils/placeholders.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';
import logger from '../../utils/logger.js';

const TIMEOUT = 60000; // 60 seconds per step

function collectMessage(channel: any, userId: string, timeout: number): Promise<string | null> {
  return new Promise((resolve) => {
    const filter = (m: any) => m.author.id === userId;
    const collector = channel.createMessageCollector({ filter, max: 1, time: timeout });

    collector.on('collect', (m: any) => {
      resolve(m.content);
    });
    collector.on('end', (collected: any) => {
      if (collected.size === 0) resolve(null);
    });
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName('setup-leave-message')
    .setDescription('Customize the leave message embed'),

  async execute(interaction: any) {
    const hasPermission = await requireStaff(interaction);
    if (!hasPermission) return;

    await interaction.deferReply();

    const configService = new ConfigService();

    // Show placeholder guide
    const guideEmbed = new EmbedBuilder()
      .setTitle('Available Placeholders')
      .setDescription(PLACEHOLDER_GUIDE)
      .setColor('#0099ff' as ColorResolvable)
      .setFooter({ text: 'You will be prompted step by step below' });

    await interaction.editReply({ embeds: [guideEmbed] });

    const channel = interaction.channel;
    const userId = interaction.user.id;

    // Step 1: Title
    await channel.send({ content: '**Step 1:** What would you like the title to be?' });
    const title = await collectMessage(channel, userId, TIMEOUT);
    if (!title) {
      await channel.send({ content: 'Setup cancelled — no response received.' });
      return;
    }

    // Step 2: Message
    await channel.send({ content: '**Step 2:** What would you like the description text to be?' });
    const message = await collectMessage(channel, userId, TIMEOUT);
    if (!message) {
      await channel.send({ content: 'Setup cancelled — no response received.' });
      return;
    }

    // Step 3: Color
    await channel.send({ content: '**Step 3:** What color would you like? (hex format, e.g. `#ff0000`)' });
    const colorInput = await collectMessage(channel, userId, TIMEOUT);
    if (!colorInput) {
      await channel.send({ content: 'Setup cancelled — no response received.' });
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(colorInput)) {
      await channel.send({ embeds: [createErrorEmbed('Error', 'Invalid color format. Please use hex format like `#ff0000`.')] });
      return;
    }

    // Step 4: Footer image
    await channel.send({ content: '**Step 4:** Paste in your footer image URL (large banner image at the bottom, type `n` if you do not want one)' });
    const footerImageInput = await collectMessage(channel, userId, TIMEOUT);
    if (!footerImageInput) {
      await channel.send({ content: 'Setup cancelled — no response received.' });
      return;
    }

    const footerImage = footerImageInput.toLowerCase() === 'n' ? '' : footerImageInput;

    if (footerImage && !validateUrl(footerImage)) {
      await channel.send({ embeds: [createErrorEmbed('Error', 'Invalid footer image URL. Setup cancelled.')] });
      return;
    }

    // Save config
    await configService.updateConfig({
      leaveTitle: title,
      leaveMessage: message,
      leaveColor: colorInput,
      leaveFooterImage: footerImage
    });

    await channel.send({ embeds: [createSuccessEmbed('Leave Message Updated', 'The leave message has been customized successfully.')] });

    logger.info(`Leave message customized by ${interaction.user.tag}`);
  }
};
