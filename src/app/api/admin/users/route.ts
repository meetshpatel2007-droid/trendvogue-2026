import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess, paginate, setPaginationMeta } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const page   = parseInt(searchParams.get("page")  ?? "1");
    const limit  = parseInt(searchParams.get("limit") ?? "20");

    const where = search
      ? {
          OR: [
            { name:  { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
          role: "USER" as const,
        }
      : { role: "USER" as const };

    const { skip, take } = paginate(page, limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, isBlocked: true, createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return apiSuccess({ users, pagination: setPaginationMeta(total, page, limit) });
  } catch (error) {
    return apiError("Failed to fetch users", 500);
  }
}
