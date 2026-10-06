import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/lib/prisma";
import { hashPassword } from "@/server/lib/bcrypt";
import { signAccessToken, signRefreshToken } from "@/server/lib/jwt";
import { registerSchema } from "@/server/schemas/auth.schema";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422);
    }

    const { name, email, phone, password } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "USER",
      },
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

    // Issue tokens
    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    const response = apiSuccess({ user }, 201);
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[AUTH REGISTER]", error);
    return apiError("Registration failed. Please try again.", 500);
  }
}
