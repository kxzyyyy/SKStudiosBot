import { GuildMember, PermissionResolvable, ChatInputCommandInteraction } from 'discord.js';
import { ConfigService } from '../services/config/ConfigService.js';

/**
 * Permission utilities for checking user roles and permissions
 */

/**
 * Check if a user has staff role
 */
export async function isStaff(member: GuildMember): Promise<boolean> {
  // Server owners always have staff permissions
  if (member.id === member.guild.ownerId) {
    return true;
  }

  const configService = new ConfigService();
  const config = await configService.getConfig();
  
  if (!config.staffRoleId) {
    return false;
  }
  
  return member.roles.cache.has(config.staffRoleId);
}

/**
 * Check if user has specific permissions
 */
export function hasPermission(member: GuildMember, permissions: PermissionResolvable): boolean {
  return member.permissions.has(permissions);
}

/**
 * Check if user can manage tickets (staff only)
 */
export async function canManageTickets(member: GuildMember): Promise<boolean> {
  return await isStaff(member);
}

/**
 * Check if user can use admin commands
 */
export async function isAdmin(member: GuildMember): Promise<boolean> {
  return await isStaff(member);
}

/**
 * Require staff permission for command execution
 */
export async function requireStaff(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (!interaction.member || !(interaction.member instanceof GuildMember)) {
    await interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true
    });
    return false;
  }

  const hasStaffRole = await isStaff(interaction.member);
  
  if (!hasStaffRole) {
    await interaction.reply({
      content: 'You do not have permission to use this command.',
      ephemeral: true
    });
    return false;
  }
  
  return true;
}
