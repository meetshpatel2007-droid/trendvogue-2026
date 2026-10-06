import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { forgotPasswordSchema } from "@/server/schemas/auth.schema";
import { apiError, apiSuccess } from "@/lib/api-helpers";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return apiSuccess({
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Generate a reset token
    const token     = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    // In production, send email. Here we console.log the link.
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    console.log("\n🔐 Password Reset Link (dev mode):");
    console.log(resetUrl);
    console.log("Expires at:", expiresAt.toISOString(), "\n");

    return apiSuccess({
      message: "If an account with that email exists, a reset link has been sent.",
      // Only expose token in dev for testing convenience
      ...(process.env.NODE_ENV === "development" && { devResetUrl: resetUrl }),
    });
  } catch (error) {
    console.error("[FORGOT PASSWORD]", error);
    return apiError("Failed to process request", 500);
  }
}
