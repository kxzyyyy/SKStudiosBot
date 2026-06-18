import { GuildMember, PermissionResolvable, ChatInputCommandInteraction } from 'discord.js';
import { ConfigService } from '../services/config/ConfigService.js';

export async function isStaff(member: GuildMember): Promise<boolean> {
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

export function hasPermission(member: GuildMember, permissions: PermissionResolvable): boolean {
  return member.permissions.has(permissions);
}

export async function canManageTickets(member: GuildMember): Promise<boolean> {
  return await isStaff(member);
}

export async function isAdmin(member: GuildMember): Promise<boolean> {
  return await isStaff(member);
}

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
