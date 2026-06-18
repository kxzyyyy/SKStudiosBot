import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

/**
 * Ticket data schema
 */
export const ticketSchema = z.object({
  ticketNumber: z.number().int().positive(),
  userId: z.string(),
  channelId: z.string(),
  status: z.enum(['open', 'closed', 'claimed']),
  claimedBy: z.string().nullable(),
  openTime: z.string().datetime(),
  closeTime: z.string().datetime().nullable(),
  transcriptPath: z.string().nullable(),
  serviceType: z.string().optional()
});

/**
 * Review data schema
 */
export const reviewSchema = z.object({
  userId: z.string(),
  username: z.string(),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(10).max(1000),
  date: z.string().datetime(),
  serviceType: z.string().optional(),
  developer: z.string().optional()
});

/**
 * Config data schema
 */
export const configSchema = z.object({
  ticketCategoryId: z.string(),
  transcriptChannelId: z.string(),
  reviewChannelId: z.string(),
  staffRoleId: z.string(),
  ticketPanelChannelId: z.string(),
  closedTicketCategoryId: z.string(),
  developers: z.array(z.object({
    name: z.string(),
    id: z.string()
  }))
});

/**
 * Counter data schema
 */
export const counterSchema = z.object({
  ticketNumber: z.number().int().min(0)
});

/**
 * Embed template schema
 */
export const embedTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  color: z.string(),
  footer: z.string().nullable(),
  thumbnail: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.string().datetime()
});

/**
 * Validate rating (1-5)
 */
export function validateRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

/**
 * Validate review text length
 */
export function validateReviewText(text: string): boolean {
  return text.length >= 10 && text.length <= 1000;
}

/**
 * Validate channel ID format
 */
export function validateChannelId(id: string): boolean {
  return /^\d{17,20}$/.test(id);
}

/**
 * Validate role ID format
 */
export function validateRoleId(id: string): boolean {
  return /^\d{17,20}$/.test(id);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
