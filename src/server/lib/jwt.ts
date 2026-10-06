import { SignJWT, jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "trend-vogue-access-secret-change-in-prod"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "trend-vogue-refresh-secret-change-in-prod"
);

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: "USER" | "ADMIN";
  iat?: number;
  exp?: number;
}

export async function signAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
