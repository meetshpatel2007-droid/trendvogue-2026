import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/server/lib/prisma";
import { verifyAccessToken } from "@/server/lib/jwt";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return apiError("Not authenticated", 401);

    const payload = await verifyAccessToken(token);
    if (!payload) return apiError("Invalid or expired token", 401);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    if (!user) return apiError("User not found", 404);
    if (user.isBlocked) return apiError("Account suspended", 403);

    return apiSuccess({ user });
  } catch (error) {
    console.error("[AUTH ME]", error);
    return apiError("Failed to fetch user", 500);
  }
}
