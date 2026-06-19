import { GuildMember } from 'discord.js';

export function replacePlaceholders(template: string, member: GuildMember): string {
  return template
    .replace(/\{username\}/g, member.user.username)
    .replace(/\{server_name\}/g, member.guild.name)
    .replace(/\{mention_user\}/g, `<@${member.id}>`)
    .replace(/\{member_count\}/g, `${member.guild.memberCount}`)
    .replace(/\{user_id\}/g, member.id)
    .replace(/\{user_tag\}/g, member.user.tag)
    .replace(/\{user_avatar\}/g, member.user.displayAvatarURL({ size: 256 }));
}

export const PLACEHOLDER_GUIDE = [
  '{username} - User\'s username',
  '{server_name} - Server name',
  '{mention_user} - @mention the user',
  '{member_count} - Current member count',
  '{user_id} - User\'s ID',
  '{user_tag} - User\'s tag (e.g. User#1234)',
  '{user_avatar} - User\'s avatar URL'
].join('\n');

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
