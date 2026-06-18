import { JsonStorage } from '../../storage/JsonStorage.js';
import { configSchema } from '../../utils/validation.js';

/**
 * Configuration interface
 */
export interface Config {
  ticketCategoryId: string;
  transcriptChannelId: string;
  reviewChannelId: string;
  staffRoleId: string;
  ticketPanelChannelId: string;
  closedTicketCategoryId: string;
  developers: Array<{ name: string; id: string }>;
}

/**
 * Service for managing bot configuration
 */
export class ConfigService {
  private storage: JsonStorage<Config>;

  constructor() {
    this.storage = new JsonStorage<Config>('./data/config.json', configSchema);
  }

  /**
   * Get current configuration
   */
  async getConfig(): Promise<Config> {
    const config = await this.storage.read();
    if (!config) {
      throw new Error('Configuration not found. Please run setup commands.');
    }
    return config;
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<Config>): Promise<boolean> {
    return await this.storage.update((current) => {
      if (!current) {
        throw new Error('Configuration not found');
      }
      return { ...current, ...updates };
    });
  }

  /**
   * Check if configuration is complete
   */
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

  /**
   * Get ticket category ID
   */
  async getTicketCategoryId(): Promise<string> {
    const config = await this.getConfig();
    return config.ticketCategoryId;
  }

  /**
   * Get transcript channel ID
   */
  async getTranscriptChannelId(): Promise<string> {
    const config = await this.getConfig();
    return config.transcriptChannelId;
  }

  /**
   * Get review channel ID
   */
  async getReviewChannelId(): Promise<string> {
    const config = await this.getConfig();
    return config.reviewChannelId;
  }

  /**
   * Get staff role ID
   */
  async getStaffRoleId(): Promise<string> {
    const config = await this.getConfig();
    return config.staffRoleId;
  }

  /**
   * Get ticket panel channel ID
   */
  async getTicketPanelChannelId(): Promise<string> {
    const config = await this.getConfig();
    return config.ticketPanelChannelId;
  }

  /**
   * Get closed ticket category ID
   */
  async getClosedTicketCategoryId(): Promise<string> {
    const config = await this.getConfig();
    return config.closedTicketCategoryId;
  }

  /**
   * Get developers list
   */
  async getDevelopers(): Promise<Array<{ name: string; id: string }>> {
    const config = await this.getConfig();
    return config.developers || [];
  }
}
