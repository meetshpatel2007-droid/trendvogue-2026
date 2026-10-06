import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { addressSchema } from "@/server/schemas/address.schema";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return apiError("Unauthorized", 401);

  const addresses = await prisma.address.findMany({ where: { userId: user.sub } });
  return apiSuccess({ addresses });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const body   = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    // If this is default, unset others
    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.sub },
        data:  { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...parsed.data, userId: user.sub },
    });

    return apiSuccess({ address }, 201);
  } catch (error) {
    return apiError("Failed to add address", 500);
  }
}
