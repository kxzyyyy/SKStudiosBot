import { JsonStorage } from '../../storage/JsonStorage.js';
import { reviewSchema } from '../../utils/validation.js';
import { z } from 'zod';
import logger from '../../utils/logger.js';

export interface Review {
  userId: string;
  username: string;
  rating: number;
  review: string;
  date: string;
  serviceType?: string;
  developer?: string;
}

export class ReviewService {
  private storage: JsonStorage<Review[]>;

  constructor() {
    this.storage = new JsonStorage<Review[]>('./data/reviews.json', z.array(reviewSchema));
  }

  async getAllReviews(): Promise<Review[]> {
    const reviews = await this.storage.read();
    return reviews || [];
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    const reviews = await this.getAllReviews();
    return reviews.filter(r => r.userId === userId);
  }

  async createReview(userId: string, username: string, rating: number, review: string, serviceType?: string, developer?: string): Promise<Review> {
    const newReview: Review = {
      userId,
      username,
      rating,
      review,
      date: new Date().toISOString(),
      serviceType,
      developer
    };

    await this.storage.update((reviews) => {
      const currentReviews = reviews || [];
      return [...currentReviews, newReview];
    });

    logger.info(`Review created by user ${userId} with rating ${rating} for service: ${serviceType || 'none'}, developer: ${developer || 'none'}`);
    return newReview;
  }

  async getReviewStats(): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.getAllReviews();
    
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      ratingDistribution[r.rating]++;
    });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    };
  }

  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    const reviews = await this.getAllReviews();
    return reviews
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async deleteReview(userId: string, date: string): Promise<boolean> {
    return await this.storage.update((reviews) => {
      if (!reviews) return [];
      
      const filtered = reviews.filter(r => !(r.userId === userId && r.date === date));
      if (filtered.length < reviews.length) {
        logger.info(`Review deleted for user ${userId}`);
      }
      return filtered;
    });
  }
}
