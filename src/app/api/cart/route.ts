import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const items = await prisma.cartItem.findMany({
      where:   { userId: user.sub },
      include: {
        product: {
          select: {
            id: true, name: true, price: true, mrp: true,
            images: true, stockQty: true, isActive: true,
          },
        },
      },
    });

    return apiSuccess({ items });
  } catch (error) {
    console.error("[CART GET]", error);
    return apiError("Failed to fetch cart", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { productId, size, color, quantity } = await req.json();
    if (!productId || !size) return apiError("Product and size are required", 422);

    // Upsert cart item
    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId_size_color: {
          userId: user.sub,
          productId,
          size,
          color: color ?? "",
        },
      },
      update: { quantity: { increment: quantity ?? 1 } },
      create: {
        userId: user.sub,
        productId,
        size,
        color: color ?? "",
        quantity: quantity ?? 1,
      },
      include: { product: true },
    });

    return apiSuccess({ item }, 201);
  } catch (error) {
    console.error("[CART POST]", error);
    return apiError("Failed to add to cart", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    // Clear entire cart
    await prisma.cartItem.deleteMany({ where: { userId: user.sub } });
    return apiSuccess({ message: "Cart cleared" });
  } catch (error) {
    return apiError("Failed to clear cart", 500);
  }
}
