import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiNotFound, apiSuccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await getServerUser();
  if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

  const { id } = await params;
  const target = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: { include: { product: { select: { name: true, images: true } } } } },
      },
      addresses: true,
    },
  });

  if (!target) return apiNotFound("User not found");
  return apiSuccess({ user: target });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { id }   = await params;
    const { isBlocked } = await req.json();

    if (typeof isBlocked !== "boolean") return apiError("Invalid payload", 422);

    const updated = await prisma.user.update({
      where: { id },
      data:  { isBlocked },
      select: { id: true, name: true, email: true, isBlocked: true },
    });

    return apiSuccess({ user: updated });
  } catch (error) {
    return apiError("Failed to update user", 500);
  }
}
