import { JsonStorage } from '../../storage/JsonStorage.js';
import { ticketSchema } from '../../utils/validation.js';
import { TicketNumberService } from './TicketNumberService.js';
import { z } from 'zod';
import logger from '../../utils/logger.js';

export interface Ticket {
  ticketNumber: number;
  userId: string;
  channelId: string;
  status: 'open' | 'closed' | 'claimed';
  claimedBy: string | null;
  openTime: string;
  closeTime: string | null;
  transcriptPath: string | null;
  serviceType?: string;
}

export class TicketService {
  private storage: JsonStorage<Ticket[]>;
  private ticketNumberService: TicketNumberService;

  constructor() {
    this.storage = new JsonStorage<Ticket[]>('./data/tickets.json', z.array(ticketSchema));
    this.ticketNumberService = new TicketNumberService();
  }

  async getAllTickets(): Promise<Ticket[]> {
    const tickets = await this.storage.read();
    return tickets || [];
  }

  async getTicketByChannelId(channelId: string): Promise<Ticket | null> {
    const tickets = await this.getAllTickets();
    return tickets.find(t => t.channelId === channelId) || null;
  }

  async getTicketByNumber(ticketNumber: number): Promise<Ticket | null> {
    const tickets = await this.getAllTickets();
    return tickets.find(t => t.ticketNumber === ticketNumber) || null;
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    const tickets = await this.getAllTickets();
    return tickets.filter(t => t.userId === userId);
  }

  async getUserOpenTickets(userId: string): Promise<Ticket[]> {
    const tickets = await this.getUserTickets(userId);
    return tickets.filter(t => t.status === 'open' || t.status === 'claimed');
  }

  async createTicket(userId: string, channelId: string, serviceType?: string): Promise<Ticket> {
    const openTickets = await this.getUserOpenTickets(userId);
    if (openTickets.length > 0) {
      throw new Error('You already have an open ticket. Please close it before creating a new one.');
    }

    const ticketNumber = await this.ticketNumberService.incrementTicketNumber();
    
    const newTicket: Ticket = {
      ticketNumber,
      userId,
      channelId,
      status: 'open',
      claimedBy: null,
      openTime: new Date().toISOString(),
      closeTime: null,
      transcriptPath: null,
      serviceType
    };

    await this.storage.update((tickets) => {
      const currentTickets = tickets || [];
      return [...currentTickets, newTicket];
    });

    logger.info(`Ticket #${ticketNumber} created for user ${userId} with service type: ${serviceType || 'none'}`);
    return newTicket;
  }

  async updateTicketStatus(channelId: string, status: 'open' | 'closed' | 'claimed'): Promise<boolean> {
    return await this.storage.update((tickets) => {
      if (!tickets) return [];
      
      return tickets.map(ticket => {
        if (ticket.channelId === channelId) {
          logger.info(`Ticket #${ticket.ticketNumber} status updated to ${status}`);
          return { ...ticket, status };
        }
        return ticket;
      });
    });
  }

  async claimTicket(channelId: string, staffUserId: string): Promise<boolean> {
    return await this.storage.update((tickets) => {
      if (!tickets) return [];
      
      return tickets.map(ticket => {
        if (ticket.channelId === channelId) {
          logger.info(`Ticket #${ticket.ticketNumber} claimed by ${staffUserId}`);
          return { ...ticket, status: 'claimed', claimedBy: staffUserId };
        }
        return ticket;
      });
    });
  }

  async closeTicket(channelId: string, transcriptPath: string | null): Promise<boolean> {
    return await this.storage.update((tickets) => {
      if (!tickets) return [];
      
      return tickets.map(ticket => {
        if (ticket.channelId === channelId) {
          logger.info(`Ticket #${ticket.ticketNumber} closed`);
          return { 
            ...ticket, 
            status: 'closed', 
            closeTime: new Date().toISOString(),
            transcriptPath 
          };
        }
        return ticket;
      });
    });
  }

  async reopenTicket(channelId: string): Promise<boolean> {
    return await this.storage.update((tickets) => {
      if (!tickets) return [];
      
      return tickets.map(ticket => {
        if (ticket.channelId === channelId) {
          logger.info(`Ticket #${ticket.ticketNumber} reopened`);
          return { 
            ...ticket, 
            status: 'open', 
            closeTime: null,
            claimedBy: null
          };
        }
        return ticket;
      });
    });
  }

  async deleteTicket(channelId: string): Promise<boolean> {
    return await this.storage.update((tickets) => {
      if (!tickets) return [];
      
      const filtered = tickets.filter(t => t.channelId !== channelId);
      if (filtered.length < tickets.length) {
        logger.info(`Ticket with channel ${channelId} deleted from storage`);
      }
      return filtered;
    });
  }
}
