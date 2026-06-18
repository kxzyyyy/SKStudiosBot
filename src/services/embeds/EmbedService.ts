import { JsonStorage } from '../../storage/JsonStorage.js';
import { embedTemplateSchema } from '../../utils/validation.js';
import logger from '../../utils/logger.js';

export interface EmbedTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  footer: string | null;
  thumbnail: string | null;
  image: string | null;
  createdAt: string;
}

export class EmbedService {
  private storage: JsonStorage<EmbedTemplate[]>;

  constructor() {
    this.storage = new JsonStorage<EmbedTemplate[]>('./data/embeds.json', z.array(embedTemplateSchema));
  }

  async getAllTemplates(): Promise<EmbedTemplate[]> {
    const templates = await this.storage.read();
    return templates || [];
  }

  async getTemplateById(id: string): Promise<EmbedTemplate | null> {
    const templates = await this.getAllTemplates();
    return templates.find(t => t.id === id) || null;
  }

  async createTemplate(
    name: string,
    title: string,
    description: string,
    color: string,
    footer: string | null,
    thumbnail: string | null,
    image: string | null
  ): Promise<EmbedTemplate> {
    const newTemplate: EmbedTemplate = {
      id: Date.now().toString(),
      name,
      title,
      description,
      color,
      footer,
      thumbnail,
      image,
      createdAt: new Date().toISOString()
    };

    await this.storage.update((templates) => {
      const currentTemplates = templates || [];
      return [...currentTemplates, newTemplate];
    });

    logger.info(`Embed template created: ${name}`);
    return newTemplate;
  }

  async updateTemplate(
    id: string,
    updates: Partial<Omit<EmbedTemplate, 'id' | 'createdAt'>>
  ): Promise<boolean> {
    return await this.storage.update((templates) => {
      if (!templates) return [];
      
      return templates.map(template => {
        if (template.id === id) {
          logger.info(`Embed template updated: ${id}`);
          return { ...template, ...updates };
        }
        return template;
      });
    });
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return await this.storage.update((templates) => {
      if (!templates) return [];
      
      const filtered = templates.filter(t => t.id !== id);
      if (filtered.length < templates.length) {
        logger.info(`Embed template deleted: ${id}`);
      }
      return filtered;
    });
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
