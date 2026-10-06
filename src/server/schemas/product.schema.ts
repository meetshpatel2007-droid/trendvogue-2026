import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  mrp: z.number().positive("MRP must be positive"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  colors: z.array(z.string()).default([]),
  stockQty: z.number().int().min(0, "Stock must be 0 or more"),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1, "Category is required"),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sizes: z.string().optional(), // comma-separated
  colors: z.string().optional(),
  sort: z
    .enum(["price_asc", "price_desc", "newest", "popularity"])
    .optional()
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
