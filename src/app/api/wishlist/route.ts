import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const items = await prisma.wishlistItem.findMany({
      where:   { userId: user.sub },
      include: {
        product: {
          select: {
            id: true, name: true, price: true, mrp: true,
            images: true, stockQty: true, isActive: true,
            category: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return apiSuccess({ items });
  } catch (error) {
    return apiError("Failed to fetch wishlist", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { productId } = await req.json();
    if (!productId) return apiError("Product ID required", 422);

    // Toggle wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: user.sub, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return apiSuccess({ action: "removed" });
    }

    const item = await prisma.wishlistItem.create({
      data: { userId: user.sub, productId },
    });

    return apiSuccess({ action: "added", item }, 201);
  } catch (error) {
    return apiError("Failed to update wishlist", 500);
  }
}
