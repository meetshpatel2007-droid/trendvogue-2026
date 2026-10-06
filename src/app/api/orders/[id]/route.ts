import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { updateOrderStatusSchema } from "@/server/schemas/order.schema";
import { getServerUser } from "@/lib/auth";
import { apiError, apiNotFound, apiSuccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, price: true, sizes: true },
            },
          },
        },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) return apiNotFound("Order not found");

    // Users can only see their own orders; admins can see all
    if (user.role !== "ADMIN" && order.userId !== user.sub) {
      return apiError("Forbidden", 403);
    }

    return apiSuccess({ order });
  } catch (error) {
    console.error("[ORDER GET]", error);
    return apiError("Failed to fetch order", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();

    // Get the current order
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return apiNotFound("Order not found");

    // User can only cancel their own order if status allows
    if (user.role !== "ADMIN") {
      if (order.userId !== user.sub) return apiError("Forbidden", 403);
      if (!["ORDERED", "PACKED"].includes(order.status)) {
        return apiError("This order can no longer be cancelled", 400);
      }
      // Users can only cancel
      if (body.status !== "CANCELLED") {
        return apiError("You can only cancel orders", 403);
      }
    }

    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    const updated = await prisma.order.update({
      where: { id },
      data:  { status: parsed.data.status },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true } },
          },
        },
      },
    });

    // Restore stock if cancelled
    if (parsed.data.status === "CANCELLED") {
      for (const item of updated.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data:  { stockQty: { increment: item.quantity } },
        });
      }
    }

    return apiSuccess({ order: updated });
  } catch (error) {
    console.error("[ORDER PATCH]", error);
    return apiError("Failed to update order", 500);
  }
}
