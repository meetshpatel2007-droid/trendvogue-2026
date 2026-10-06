import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/server/lib/prisma";
import { createOrderSchema } from "@/server/schemas/order.schema";
import { calculateDeliveryEstimate } from "@/server/lib/delivery-estimate";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess, paginate, setPaginationMeta } from "@/lib/api-helpers";
import { getDeliveryFee } from "@/lib/utils";

class OutOfStockError extends Error {}

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get("page")  ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const where = user.role === "ADMIN" ? {} : { userId: user.sub };

    const { skip, take } = paginate(page, limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          items: {
            include: {
              product: {
                select: { name: true, images: true, price: true },
              },
            },
          },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return apiSuccess({
      orders,
      pagination: setPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error("[ORDERS GET]", error);
    return apiError("Failed to fetch orders", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getServerUser();
    if (!authUser) return apiError("Please login to place an order", 401);

    const body   = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 422);

    // Load the products for the submitted cart lines (prices come from the DB)
    const { items } = parsed.data;
    const products = await prisma.product.findMany({
      where:  { id: { in: [...new Set(items.map((i) => i.productId))] } },
      select: { id: true, name: true, price: true, stockQty: true, isActive: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    // Total quantity per product (the same product can appear in several sizes)
    const qtyByProduct = new Map<string, number>();
    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product || !product.isActive) {
        return apiError("An item in your cart is no longer available", 400);
      }
      qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.quantity);
    }

    // Verify stock availability
    for (const [productId, qty] of qtyByProduct) {
      const product = productById.get(productId)!;
      if (product.stockQty < qty) {
        return apiError(`"${product.name}" only has ${product.stockQty} in stock`, 400);
      }
    }

    // Resolve shipping address
    let addressSnap: Prisma.InputJsonObject;
    let pincode: string;

    if (parsed.data.addressId) {
      const addr = await prisma.address.findFirst({
        where: { id: parsed.data.addressId, userId: authUser.sub },
      });
      if (!addr) return apiError("Address not found", 404);
      addressSnap = { ...addr };
      pincode = addr.pincode;
    } else if (parsed.data.newAddress) {
      addressSnap = { ...parsed.data.newAddress };
      pincode = parsed.data.newAddress.pincode;
    } else {
      return apiError("Please provide a delivery address", 400);
    }

    // Calculate delivery estimate
    const delivery = calculateDeliveryEstimate(pincode);

    // Compute total (items + delivery fee, matching what checkout displays)
    const subtotal = items.reduce(
      (sum, item) => sum + productById.get(item.productId)!.price * item.quantity,
      0
    );
    const totalAmount = subtotal + getDeliveryFee(subtotal);

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Reduce stock first; the stockQty guard stops two simultaneous orders
      // from overselling the last units (a failed guard rolls everything back)
      for (const [productId, qty] of qtyByProduct) {
        const { count } = await tx.product.updateMany({
          where: { id: productId, stockQty: { gte: qty } },
          data:  { stockQty: { decrement: qty } },
        });
        if (count === 0) throw new OutOfStockError(productById.get(productId)!.name);
      }

      const newOrder = await tx.order.create({
        data: {
          userId:           authUser.sub,
          addressSnap,
          paymentMethod:    parsed.data.paymentMethod,
          paymentStatus:
            parsed.data.paymentMethod === "COD" ? "PENDING" : "PAID",
          status:           "ORDERED",
          totalAmount,
          estimatedDelivery: delivery.estimatedDelivery,
          pincodeDeliveryTier: delivery.tier,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              size:      item.size,
              color:     item.color ?? "",
              quantity:  item.quantity,
              price:     productById.get(item.productId)!.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { name: true, images: true } },
            },
          },
        },
      });

      // Clear any server-side cart lines
      await tx.cartItem.deleteMany({ where: { userId: authUser.sub } });

      return newOrder;
    });

    return apiSuccess({
      order,
      delivery: {
        estimatedDelivery: delivery.estimatedDelivery,
        label:             delivery.label,
        tier:              delivery.tier,
        minDays:           delivery.minDays,
        maxDays:           delivery.maxDays,
      },
    }, 201);
  } catch (error) {
    if (error instanceof OutOfStockError) {
      return apiError(`"${error.message}" just went out of stock`, 409);
    }
    console.error("[ORDERS POST]", error);
    return apiError("Failed to place order. Please try again.", 500);
  }
}
