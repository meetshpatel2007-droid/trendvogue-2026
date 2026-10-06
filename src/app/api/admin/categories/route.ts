import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    const isAdmin = user?.role === "ADMIN";

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: isAdmin ? { _count: { select: { products: true } } } : undefined,
    });

    return apiSuccess({ categories });
  } catch (error) {
    return apiError("Failed to fetch categories", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { name, slug, sortOrder } = await req.json();
    if (!name || !slug) return apiError("Name and slug are required", 422);

    const cat = await prisma.category.create({
      data: { name, slug, sortOrder: sortOrder ?? 0 },
    });

    return apiSuccess({ category: cat }, 201);
  } catch (error) {
    return apiError("Failed to create category", 500);
  }
}
