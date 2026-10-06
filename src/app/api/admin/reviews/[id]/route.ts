import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { id } = await params;
    await prisma.review.delete({ where: { id } });

    return apiSuccess({ message: "Review deleted" });
  } catch (error) {
    return apiError("Failed to delete review", 500);
  }
}
