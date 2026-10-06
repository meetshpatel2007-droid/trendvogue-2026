import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be 1–5 stars"),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
