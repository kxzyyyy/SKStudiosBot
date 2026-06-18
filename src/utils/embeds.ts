import { EmbedBuilder, ColorResolvable } from 'discord.js';

/**
 * Embed utilities for creating consistent Discord embeds
 */

/**
 * Create a success embed
 */
export function createSuccessEmbed(title: string, description?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description || '')
    .setColor('#00ff00' as ColorResolvable)
    .setTimestamp();
}

/**
 * Create an error embed
 */
export function createErrorEmbed(title: string, description?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description || '')
    .setColor('#ff0000' as ColorResolvable)
    .setTimestamp();
}

/**
 * Create an info embed
 */
export function createInfoEmbed(title: string, description?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description || '')
    .setColor('#0099ff' as ColorResolvable)
    .setTimestamp();
}

/**
 * Create a warning embed
 */
export function createWarningEmbed(title: string, description?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description || '')
    .setColor('#ffcc00' as ColorResolvable)
    .setTimestamp();
}

/**
 * Create a custom embed with all options
 */
export function createCustomEmbed(options: {
  title?: string;
  description?: string;
  color?: string | number;
  footer?: string;
  thumbnail?: string;
  image?: string;
  author?: {
    name: string;
    iconURL?: string;
  };
}): EmbedBuilder {
  const embed = new EmbedBuilder();
  
  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.color) embed.setColor(options.color as ColorResolvable);
  if (options.footer) embed.setFooter({ text: options.footer });
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.author) {
    embed.setAuthor({
      name: options.author.name,
      iconURL: options.author.iconURL
    });
  }
  
  embed.setTimestamp();
  
  return embed;
}
