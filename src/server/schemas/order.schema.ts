import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().optional(),
  newAddress: z
    .object({
      line1: z.string().min(5, "Address is required"),
      line2: z.string().optional(),
      city: z.string().min(2, "City is required"),
      state: z.string().min(2, "State is required"),
      pincode: z
        .string()
        .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
      phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    })
    .optional(),
  paymentMethod: z.enum(["COD", "DUMMY_ONLINE"]),
}).refine(
  (data) => data.addressId || data.newAddress,
  { message: "Either select a saved address or enter a new one" }
);

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "ORDERED",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
