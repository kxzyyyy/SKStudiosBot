import { z } from 'zod';

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

export const reviewSchema = z.object({
  userId: z.string(),
  username: z.string(),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(10).max(1000),
  date: z.string().datetime(),
  serviceType: z.string().optional(),
  developer: z.string().optional()
});

export const configSchema = z.object({
  ticketCategoryId: z.string(),
  transcriptChannelId: z.string(),
  reviewChannelId: z.string(),
  staffRoleId: z.string(),
  ticketPanelChannelId: z.string(),
  closedTicketCategoryId: z.string(),
  autoroleId: z.string(),
  welcomeChannelId: z.string(),
  welcomeTitle: z.string(),
  welcomeMessage: z.string(),
  welcomeColor: z.string(),
  welcomeFooterImage: z.string(),
  leaveChannelId: z.string(),
  leaveTitle: z.string(),
  leaveMessage: z.string(),
  leaveColor: z.string(),
  leaveFooterImage: z.string(),
  developers: z.array(z.object({
    name: z.string(),
    id: z.string()
  }))
});

export const counterSchema = z.object({
  ticketNumber: z.number().int().min(0)
});

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

export function validateRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

export function validateReviewText(text: string): boolean {
  return text.length >= 10 && text.length <= 1000;
}

export function validateChannelId(id: string): boolean {
  return /^\d{17,20}$/.test(id);
}

export function validateRoleId(id: string): boolean {
  return /^\d{17,20}$/.test(id);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
