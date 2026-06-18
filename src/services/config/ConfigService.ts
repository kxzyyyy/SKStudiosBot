import { JsonStorage } from '../../storage/JsonStorage.js';
import { configSchema } from '../../utils/validation.js';

export interface Config {
  ticketCategoryId: string;
  transcriptChannelId: string;
  reviewChannelId: string;
  staffRoleId: string;
  ticketPanelChannelId: string;
  closedTicketCategoryId: string;
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
}
