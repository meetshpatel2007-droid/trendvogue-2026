import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { addressSchema } from "@/server/schemas/address.schema";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { id }  = await params;
    const body    = await req.json();
    const parsed  = addressSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.sub },
        data:  { isDefault: false },
      });
    }

    const address = await prisma.address.updateMany({
      where: { id, userId: user.sub },
      data:  parsed.data,
    });

    return apiSuccess({ address });
  } catch (error) {
    return apiError("Failed to update address", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { id } = await params;
    await prisma.address.deleteMany({ where: { id, userId: user.sub } });

    return apiSuccess({ message: "Address deleted" });
  } catch (error) {
    return apiError("Failed to delete address", 500);
  }
}
