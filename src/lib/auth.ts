import { cookies } from "next/headers";
import { verifyAccessToken, type JWTPayload } from "@/server/lib/jwt";

export async function getServerUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(): Promise<JWTPayload> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}
