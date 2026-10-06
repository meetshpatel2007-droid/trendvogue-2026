import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { createOrderSchema } from "@/server/schemas/order.schema";
import { calculateDeliveryEstimate } from "@/server/lib/delivery-estimate";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess, paginate, setPaginationMeta } from "@/lib/api-helpers";

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

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where:   { userId: authUser.sub },
      include: { product: true },
    });

    if (cartItems.length === 0) return apiError("Your cart is empty", 400);

    // Verify stock availability
    for (const item of cartItems) {
      if (item.product.stockQty < item.quantity) {
        return apiError(
          `"${item.product.name}" only has ${item.product.stockQty} in stock`,
          400
        );
      }
    }

    // Resolve shipping address
    let addressSnap: Record<string, unknown>;
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

    // Compute total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
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
            create: cartItems.map((item) => ({
              productId: item.productId,
              size:      item.size,
              color:     item.color ?? "",
              quantity:  item.quantity,
              price:     item.product.price,
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

      // Reduce stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { stockQty: { decrement: item.quantity } },
        });
      }

      // Clear cart
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
    console.error("[ORDERS POST]", error);
    return apiError("Failed to place order. Please try again.", 500);
  }
}
