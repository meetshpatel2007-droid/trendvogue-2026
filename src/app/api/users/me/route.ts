import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { updateProfileSchema, changePasswordSchema } from "@/server/schemas/address.schema";
import { getServerUser } from "@/lib/auth";
import { comparePassword, hashPassword } from "@/server/lib/bcrypt";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const profile = await prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, createdAt: true,
        addresses: true,
        _count: { select: { orders: true } },
      },
    });

    if (!profile) return apiError("User not found", 404);
    return apiSuccess({ user: profile });
  } catch (error) {
    return apiError("Failed to fetch profile", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const body = await req.json();

    // Handle password change separately
    if (body.currentPassword) {
      const pwParsed = changePasswordSchema.safeParse(body);
      if (!pwParsed.success) return apiError(pwParsed.error.errors[0].message, 422);

      const dbUser = await prisma.user.findUnique({
        where:  { id: user.sub },
        select: { passwordHash: true },
      });
      if (!dbUser) return apiError("User not found", 404);

      const valid = await comparePassword(pwParsed.data.currentPassword, dbUser.passwordHash);
      if (!valid) return apiError("Current password is incorrect", 401);

      const newHash = await hashPassword(pwParsed.data.newPassword);
      await prisma.user.update({ where: { id: user.sub }, data: { passwordHash: newHash } });

      return apiSuccess({ message: "Password updated successfully" });
    }

    // Profile update
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    const updated = await prisma.user.update({
      where:  { id: user.sub },
      data:   parsed.data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return apiSuccess({ user: updated });
  } catch (error) {
    return apiError("Failed to update profile", 500);
  }
}
