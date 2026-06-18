import { JsonStorage } from '../../storage/JsonStorage.js';
import { ticketSchema } from '../../utils/validation.js';
import { TicketNumberService } from './TicketNumberService.js';
import { z } from 'zod';
import logger from '../../utils/logger.js';

/**
 * Ticket interface
 */
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

/**
 * Service for managing tickets
 */
export class TicketService {
  private storage: JsonStorage<Ticket[]>;
  private ticketNumberService: TicketNumberService;

  constructor() {
    this.storage = new JsonStorage<Ticket[]>('./data/tickets.json', z.array(ticketSchema));
    this.ticketNumberService = new TicketNumberService();
  }

  /**
   * Get all tickets
   */
  async getAllTickets(): Promise<Ticket[]> {
    const tickets = await this.storage.read();
    return tickets || [];
  }

  /**
   * Get ticket by channel ID
   */
  async getTicketByChannelId(channelId: string): Promise<Ticket | null> {
    const tickets = await this.getAllTickets();
    return tickets.find(t => t.channelId === channelId) || null;
  }

  /**
   * Get ticket by ticket number
   */
  async getTicketByNumber(ticketNumber: number): Promise<Ticket | null> {
    const tickets = await this.getAllTickets();
    return tickets.find(t => t.ticketNumber === ticketNumber) || null;
  }

  /**
   * Get all tickets for a user
   */
  async getUserTickets(userId: string): Promise<Ticket[]> {
    const tickets = await this.getAllTickets();
    return tickets.filter(t => t.userId === userId);
  }

  /**
   * Get open tickets for a user
   */
  async getUserOpenTickets(userId: string): Promise<Ticket[]> {
    const tickets = await this.getUserTickets(userId);
    return tickets.filter(t => t.status === 'open' || t.status === 'claimed');
  }

  /**
   * Create a new ticket
   */
  async createTicket(userId: string, channelId: string, serviceType?: string): Promise<Ticket> {
    // Check if user has open tickets
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

  /**
   * Update ticket status
   */
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

  /**
   * Claim a ticket
   */
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

  /**
   * Close a ticket
   */
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

  /**
   * Reopen a ticket
   */
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

  /**
   * Delete a ticket from storage (after channel deletion)
   */
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
