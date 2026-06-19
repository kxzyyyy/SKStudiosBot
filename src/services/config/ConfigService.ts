import { JsonStorage } from '../../storage/JsonStorage.js';
import { configSchema } from '../../utils/validation.js';

export interface Config {
  ticketCategoryId: string;
  transcriptChannelId: string;
  reviewChannelId: string;
  staffRoleId: string;
  ticketPanelChannelId: string;
  closedTicketCategoryId: string;
  autoroleId: string;
  welcomeChannelId: string;
  welcomeTitle: string;
  welcomeMessage: string;
  welcomeColor: string;
  welcomeFooterImage: string;
  leaveChannelId: string;
  leaveTitle: string;
  leaveMessage: string;
  leaveColor: string;
  leaveFooterImage: string;
  developers: Array<{ name: string; id: string }>;
}

export class ConfigService {
  private storage: JsonStorage<Config>;

  constructor() {
    this.storage = new JsonStorage<Config>('./data/config.json', configSchema);
  }

  async getConfig(): Promise<Config> {
    const config = await this.storage.read();
    if (!config) {
      throw new Error('Configuration not found. Please run setup commands.');
    }
    return config;
  }

  async updateConfig(updates: Partial<Config>): Promise<boolean> {
    return await this.storage.update((current) => {
      if (!current) {
        throw new Error('Configuration not found');
      }
      return { ...current, ...updates };
    });
  }

  async isConfigured(): Promise<boolean> {
    const config = await this.storage.read();
    if (!config) return false;

    return !!(
        config.ticketCategoryId &&
        config.transcriptChannelId &&
        config.reviewChannelId &&
        config.staffRoleId &&
        config.ticketPanelChannelId
    );
  }

  async getTicketCategoryId(): Promise<string> {
    const config = await this.getConfig();
    return config.ticketCategoryId;
  }

  async getTranscriptChannelId(): Promise<string> {
    const config = await this.getConfig();
    return config.transcriptChannelId;
  }

  async getReviewChannelId(): Promise<string> {
    const config = await this.getConfig();
    return config.reviewChannelId;
  }

  async getStaffRoleId(): Promise<string> {
    const config = await this.getConfig();
    return config.staffRoleId;
  }

  async getTicketPanelChannelId(): Promise<string> {
    const config = await this.getConfig();
    return config.ticketPanelChannelId;
  }

  async getClosedTicketCategoryId(): Promise<string> {
    const config = await this.getConfig();
    return config.closedTicketCategoryId;
  }

  async getDevelopers(): Promise<Array<{ name: string; id: string }>> {
    const config = await this.getConfig();
    return config.developers || [];
  }

  async getAutoroleId(): Promise<string> {
    const config = await this.getConfig();
    return config.autoroleId;
  }

  async getWelcomeChannelId(): Promise<string> {
    const config = await this.getConfig();
    return config.welcomeChannelId;
  }

  async getLeaveChannelId(): Promise<string> {
    const config = await this.getConfig();
    return config.leaveChannelId;
  }

  async getWelcomeTitle(): Promise<string> {
    const config = await this.getConfig();
    return config.welcomeTitle;
  }

  async getWelcomeMessage(): Promise<string> {
    const config = await this.getConfig();
    return config.welcomeMessage;
  }

  async getWelcomeColor(): Promise<string> {
    const config = await this.getConfig();
    return config.welcomeColor;
  }

  async getWelcomeFooterImage(): Promise<string> {
    const config = await this.getConfig();
    return config.welcomeFooterImage;
  }

  async getLeaveTitle(): Promise<string> {
    const config = await this.getConfig();
    return config.leaveTitle;
  }

  async getLeaveMessage(): Promise<string> {
    const config = await this.getConfig();
    return config.leaveMessage;
  }

  async getLeaveColor(): Promise<string> {
    const config = await this.getConfig();
    return config.leaveColor;
  }

  async getLeaveFooterImage(): Promise<string> {
    const config = await this.getConfig();
    return config.leaveFooterImage;
  }
}
