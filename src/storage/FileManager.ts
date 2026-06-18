import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import logger from '../utils/logger.js';

export class FileManager {
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
        logger.info(`Created directory: ${dirPath}`);
      }
    } catch (error) {
      logger.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }

  static async initializeDirectories(): Promise<void> {
    const directories = [
      './data',
      './transcripts',
      './logs',
      './src/commands',
      './src/events',
      './src/interactions',
      './src/services',
      './src/utils',
    ];

    for (const dir of directories) {
      await this.ensureDir(dir);
    }
  }

  static async initializeDataFiles(): Promise<void> {
    const { writeFile } = await import('fs/promises');
    
    const defaultFiles = [
      {
        path: './data/config.json',
        content: {
          ticketCategoryId: '',
          transcriptChannelId: '',
          reviewChannelId: '',
          staffRoleId: '',
          ticketPanelChannelId: ''
        }
      },
      {
        path: './data/tickets.json',
        content: []
      },
      {
        path: './data/reviews.json',
        content: []
      },
      {
        path: './data/counters.json',
        content: {
          ticketNumber: 0
        }
      },
      {
        path: './data/embeds.json',
        content: []
      }
    ];

    for (const file of defaultFiles) {
      try {
        if (!existsSync(file.path)) {
          await writeFile(file.path, JSON.stringify(file.content, null, 2), 'utf-8');
          logger.info(`Created data file: ${file.path}`);
        }
      } catch (error) {
        logger.error(`Error creating data file ${file.path}:`, error);
      }
    }
  }
}
