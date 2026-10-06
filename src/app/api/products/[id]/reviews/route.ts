import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { createReviewSchema } from "@/server/schemas/review.schema";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where:   { productId: id },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return apiSuccess({ reviews });
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const authUser = await getServerUser();
    if (!authUser) return apiError("Please login to leave a review", 401);

    const { id: productId } = await params;
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: authUser.sub, productId } },
    });
    if (existing) return apiError("You have already reviewed this product", 409);

    // Check if user has a delivered order containing this product
    const hasDeliveredOrder = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: authUser.sub, status: "DELIVERED" },
      },
    });
    if (!hasDeliveredOrder) {
      return apiError("You can only review products you have purchased and received", 403);
    }

    const review = await prisma.review.create({
      data: {
        userId:    authUser.sub,
        productId,
        rating:    parsed.data.rating,
        comment:   parsed.data.comment,
      },
      include: { user: { select: { name: true } } },
    });

    return apiSuccess({ review }, 201);
  } catch (error) {
    console.error("[REVIEWS POST]", error);
    return apiError("Failed to submit review", 500);
  }
}
