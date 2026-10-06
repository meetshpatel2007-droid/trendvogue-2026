import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { resetPasswordSchema } from "@/server/schemas/auth.schema";
import { hashPassword } from "@/server/lib/bcrypt";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    const { token, password } = parsed.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) return apiError("Invalid or expired reset link", 400);
    if (resetToken.used)  return apiError("This reset link has already been used", 400);
    if (new Date() > resetToken.expiresAt) {
      return apiError("This reset link has expired. Please request a new one.", 400);
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    return apiSuccess({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("[RESET PASSWORD]", error);
    return apiError("Failed to reset password", 500);
  }
}
