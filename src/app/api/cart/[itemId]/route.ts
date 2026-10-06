import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { itemId } = await params;
    const { quantity } = await req.json();

    if (typeof quantity !== "number" || quantity < 0) {
      return apiError("Invalid quantity", 422);
    }

    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { id: itemId, userId: user.sub },
      });
      return apiSuccess({ message: "Item removed" });
    }

    const item = await prisma.cartItem.updateMany({
      where: { id: itemId, userId: user.sub },
      data:  { quantity },
    });

    return apiSuccess({ item });
  } catch (error) {
    return apiError("Failed to update cart item", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { itemId } = await params;
    await prisma.cartItem.deleteMany({
      where: { id: itemId, userId: user.sub },
    });

    return apiSuccess({ message: "Item removed" });
  } catch (error) {
    return apiError("Failed to remove cart item", 500);
  }
}
