import { JsonStorage } from '../../storage/JsonStorage.js';
import { counterSchema } from '../../utils/validation.js';
import logger from '../../utils/logger.js';

/**
 * Counter interface
 */
export interface Counter {
  ticketNumber: number;
}

/**
 * Service for managing ticket numbering
 */
export class TicketNumberService {
  private storage: JsonStorage<Counter>;

  constructor() {
    this.storage = new JsonStorage<Counter>('./data/counters.json', counterSchema);
  }

  /**
   * Get current ticket number
   */
  async getCurrentTicketNumber(): Promise<number> {
    const counter = await this.storage.read();
    return counter?.ticketNumber || 0;
  }

  /**
   * Increment ticket number
   */
  async incrementTicketNumber(): Promise<number> {
    const newNumber = await this.storage.update((current) => {
      const currentNumber = current?.ticketNumber || 0;
      return { ticketNumber: currentNumber + 1 };
    });
    
    if (newNumber) {
      const counter = await this.storage.read();
      logger.info(`Ticket number incremented to ${counter?.ticketNumber}`);
      return counter?.ticketNumber || 0;
    }
    
    throw new Error('Failed to increment ticket number');
  }

  /**
   * Reset ticket number (use with caution)
   */
  async resetTicketNumber(): Promise<boolean> {
    const result = await this.storage.write({ ticketNumber: 0 });
    if (result) {
      logger.warn('Ticket number reset to 0');
    }
    return result;
  }

  /**
   * Format ticket number with leading zeros (e.g., 0001)
   */
  formatTicketNumber(number: number): string {
    return number.toString().padStart(4, '0');
  }
}
