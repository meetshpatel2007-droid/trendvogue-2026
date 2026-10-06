import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { productQuerySchema, createProductSchema } from "@/server/schemas/product.schema";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess, paginate, setPaginationMeta } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const query  = productQuerySchema.parse(params);

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name:        { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {
        ...(query.minPrice ? { gte: query.minPrice } : {}),
        ...(query.maxPrice ? { lte: query.maxPrice } : {}),
      };
    }

    if (query.sizes) {
      const sizeList = query.sizes.split(",").map((s) => s.trim());
      where.sizes = { hasSome: sizeList };
    }

    if (query.colors) {
      const colorList = query.colors.split(",").map((c) => c.trim());
      where.colors = { hasSome: colorList };
    }

    const orderBy: Record<string, unknown> =
      query.sort === "price_asc"  ? { price: "asc" } :
      query.sort === "price_desc" ? { price: "desc" } :
      query.sort === "popularity" ? { orderItems: { _count: "desc" } } :
                                    { createdAt: "desc" };

    const { skip, take } = paginate(query.page, query.limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: { select: { name: true, slug: true } },
          reviews:  { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return apiSuccess({
      products,
      pagination: setPaginationMeta(total, query.page, query.limit),
    });
  } catch (error) {
    console.error("[PRODUCTS GET]", error);
    return apiError("Failed to fetch products", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const body   = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    const product = await prisma.product.create({
      data: parsed.data,
      include: { category: { select: { name: true, slug: true } } },
    });

    return apiSuccess({ product }, 201);
  } catch (error) {
    console.error("[PRODUCTS POST]", error);
    return apiError("Failed to create product", 500);
  }
}
