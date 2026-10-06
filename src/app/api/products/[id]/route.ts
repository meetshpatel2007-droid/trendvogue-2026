import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { updateProductSchema } from "@/server/schemas/product.schema";
import { getServerUser } from "@/lib/auth";
import { apiError, apiNotFound, apiSuccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, slug: true } },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) return apiNotFound("Product not found");
    return apiSuccess({ product });
  } catch (error) {
    console.error("[PRODUCT GET]", error);
    return apiError("Failed to fetch product", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { id } = await params;
    const body   = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    const product = await prisma.product.update({
      where: { id },
      data:  parsed.data,
      include: { category: { select: { name: true, slug: true } } },
    });

    return apiSuccess({ product });
  } catch (error) {
    console.error("[PRODUCT PATCH]", error);
    return apiError("Failed to update product", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { id } = await params;

    // Soft delete by deactivating instead of hard delete (preserve order history)
    await prisma.product.update({
      where: { id },
      data:  { isActive: false },
    });

    return apiSuccess({ message: "Product deleted" });
  } catch (error) {
    console.error("[PRODUCT DELETE]", error);
    return apiError("Failed to delete product", 500);
  }
}
