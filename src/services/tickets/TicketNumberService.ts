import { JsonStorage } from '../../storage/JsonStorage.js';
import { counterSchema } from '../../utils/validation.js';
import logger from '../../utils/logger.js';

export interface Counter {
  ticketNumber: number;
}

export class TicketNumberService {
  private storage: JsonStorage<Counter>;

  constructor() {
    this.storage = new JsonStorage<Counter>('./data/counters.json', counterSchema);
  }

  async getCurrentTicketNumber(): Promise<number> {
    const counter = await this.storage.read();
    return counter?.ticketNumber || 0;
  }

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

  async resetTicketNumber(): Promise<boolean> {
    const result = await this.storage.write({ ticketNumber: 0 });
    if (result) {
      logger.warn('Ticket number reset to 0');
    }
    return result;
  }

  formatTicketNumber(number: number): string {
    return number.toString().padStart(4, '0');
  }
}
