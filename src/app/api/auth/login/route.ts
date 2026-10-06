import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { comparePassword } from "@/server/lib/bcrypt";
import { signAccessToken, signRefreshToken } from "@/server/lib/jwt";
import { loginSchema } from "@/server/schemas/auth.schema";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 422);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    if (user.isBlocked) {
      return apiError("Your account has been suspended. Contact support.", 403);
    }

    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      return apiError("Invalid email or password", 401);
    }

    const { passwordHash: _, ...safeUser } = user;

    const tokenPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    const response = apiSuccess({ user: safeUser });
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[AUTH LOGIN]", error);
    return apiError("Login failed. Please try again.", 500);
  }
}
