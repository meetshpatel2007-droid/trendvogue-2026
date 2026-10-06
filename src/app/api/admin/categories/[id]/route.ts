import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { id } = await params;
    const body   = await req.json();

    const cat = await prisma.category.update({
      where: { id },
      data:  { name: body.name, slug: body.slug, sortOrder: body.sortOrder },
    });

    return apiSuccess({ category: cat });
  } catch (error) {
    return apiError("Failed to update category", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { id } = await params;

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return apiError(
        `Cannot delete — ${productCount} product(s) belong to this category. Move or delete them first.`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });
    return apiSuccess({ message: "Category deleted" });
  } catch (error) {
    return apiError("Failed to delete category", 500);
  }
}
