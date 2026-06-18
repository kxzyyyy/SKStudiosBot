import { ChannelType, TextChannel } from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import logger from '../../utils/logger.js';

/**
 * Service for generating and managing ticket transcripts
 */
export class TranscriptService {
  /**
   * Generate transcript from a channel
   */
  async generateTranscript(channel: TextChannel): Promise<Buffer> {
    try {
      // Fetch messages and filter out ones with components that cause React errors
      const messages = await channel.messages.fetch({ limit: 100 });
      const filteredMessages = messages.filter(msg => {
        // Filter out messages with components (buttons, select menus, modals)
        return !msg.components || msg.components.length === 0;
      });

      const transcript = await createTranscript(channel, {
        returnType: 'buffer',
        filename: `transcript-${channel.id}.html`,
        saveImages: false,
        poweredBy: false,
        // Use filtered messages to avoid React rendering errors
        messages: filteredMessages,
        limit: -1,
        minify: false
      });
      
      logger.info(`Transcript generated for channel ${channel.id}`);
      return transcript as Buffer;
    } catch (error) {
      logger.error(`Error generating transcript for channel ${channel.id}:`, error);
      throw new Error('Failed to generate transcript');
    }
  }

  /**
   * Save transcript to file
   */
  async saveTranscript(transcript: Buffer, ticketNumber: number): Promise<string> {
    const filename = `ticket-${ticketNumber}-${Date.now()}.html`;
    const filepath = join('./transcripts', filename);
    
    try {
      await writeFile(filepath, transcript);
      logger.info(`Transcript saved to ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(`Error saving transcript to ${filepath}:`, error);
      throw new Error('Failed to save transcript');
    }
  }

  /**
   * Generate and save transcript in one operation
   */
  async generateAndSave(channel: TextChannel, ticketNumber: number): Promise<string> {
    const transcript = await this.generateTranscript(channel);
    return await this.saveTranscript(transcript, ticketNumber);
  }

  /**
   * Send transcript to archive channel
   */
  async sendToArchiveChannel(
    transcript: Buffer, 
    archiveChannel: TextChannel, 
    ticketNumber: number,
    userId: string,
    staffMember: string,
    openTime: string,
    closeTime: string
  ): Promise<void> {
    try {
      const openDate = new Date(openTime);
      const closeDate = new Date(closeTime);
      const duration = Math.floor((closeDate.getTime() - openDate.getTime()) / 1000 / 60); // minutes

      const embed = {
        title: `📄 Ticket #${ticketNumber} Transcript`,
        color: 0x00ff00,
        fields: [
          { name: 'User ID', value: userId, inline: true },
          { name: 'Staff Member', value: staffMember, inline: true },
          { name: 'Opened', value: openDate.toLocaleString(), inline: true },
          { name: 'Closed', value: closeDate.toLocaleString(), inline: true },
          { name: 'Duration', value: `${duration} minutes`, inline: true }
        ],
        timestamp: new Date().toISOString()
      };

      await archiveChannel.send({
        content: `Ticket transcript for #${ticketNumber}`,
        embeds: [embed],
        files: [{
          attachment: transcript,
          name: `ticket-${ticketNumber}.html`
        }]
      });

      logger.info(`Transcript sent to archive channel for ticket #${ticketNumber}`);
    } catch (error) {
      logger.error(`Error sending transcript to archive channel:`, error);
      throw new Error('Failed to send transcript to archive channel');
    }
  }
}
