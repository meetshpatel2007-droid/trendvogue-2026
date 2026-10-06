import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalRevenue,
      activeUsers,
      lowStockProducts,
      recentOrders,
      ordersByStatus,
      dailyRevenue,
      topProducts,
    ] = await Promise.all([
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({ where: { role: "USER", isBlocked: false } }),
      prisma.product.count({ where: { stockQty: { lte: 5 }, isActive: true } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true, price: true } },
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      // Daily revenue for past 7 days
      prisma.$queryRaw<{ date: string; revenue: number; orders: number }[]>`
        SELECT
          DATE(created_at AT TIME ZONE 'Asia/Kolkata')::text AS date,
          SUM(total_amount)::float AS revenue,
          COUNT(*)::int AS orders
        FROM "Order"
        WHERE
          created_at >= ${sevenDaysAgo}
          AND status != 'CANCELLED'
        GROUP BY DATE(created_at AT TIME ZONE 'Asia/Kolkata')
        ORDER BY date ASC
      `,
      // Top 5 products by order count
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    // Enrich top products with product data
    const topProductIds = topProducts.map((t) => t.productId);
    const topProductData = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, price: true, images: true },
    });
    const topProductsEnriched = topProducts.map((t) => ({
      ...t,
      product: topProductData.find((p) => p.id === t.productId),
    }));

    return apiSuccess({
      kpis: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        activeUsers,
        lowStockProducts,
      },
      recentOrders,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count:  s._count._all,
      })),
      dailyRevenue,
      topProducts: topProductsEnriched,
    });
  } catch (error) {
    console.error("[ADMIN STATS]", error);
    return apiError("Failed to fetch stats", 500);
  }
}
