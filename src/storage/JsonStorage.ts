import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { z } from 'zod';
import logger from '../utils/logger.js';

/**
 * Generic JSON storage class for managing data files
 * Provides CRUD operations with type safety using Zod schemas
 */
export class JsonStorage<T> {
  private filePath: string;
  private schema: z.ZodSchema<T>;

  constructor(filePath: string, schema: z.ZodSchema<T>) {
    this.filePath = filePath;
    this.schema = schema;
  }

  /**
   * Read data from JSON file
   */
  async read(): Promise<T | null> {
    try {
      if (!existsSync(this.filePath)) {
        logger.warn(`File not found: ${this.filePath}, returning null`);
        return null;
      }

      const data = await readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Validate with Zod schema
      const validated = this.schema.parse(parsed);
      return validated;
    } catch (error) {
      logger.error(`Error reading file ${this.filePath}:`, error);
      return null;
    }
  }

  /**
   * Write data to JSON file
   */
  async write(data: T): Promise<boolean> {
    try {
      // Validate with Zod schema before writing
      const validated = this.schema.parse(data);
      
      await writeFile(this.filePath, JSON.stringify(validated, null, 2), 'utf-8');
      logger.info(`Successfully wrote to ${this.filePath}`);
      return true;
    } catch (error) {
      logger.error(`Error writing to file ${this.filePath}:`, error);
      return false;
    }
  }

  /**
   * Update data using a callback function
   */
  async update(callback: (data: T | null) => T): Promise<boolean> {
    try {
      const currentData = await this.read();
      const newData = callback(currentData);
      return await this.write(newData);
    } catch (error) {
      logger.error(`Error updating file ${this.filePath}:`, error);
      return false;
    }
  }

  /**
   * Check if file exists
   */
  exists(): boolean {
    return existsSync(this.filePath);
  }
}
