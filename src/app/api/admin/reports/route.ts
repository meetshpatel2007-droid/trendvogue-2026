import { NextRequest } from "next/server";
import prisma from "@/server/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const { searchParams } = new URL(req.url);
    const exportCsv = searchParams.get("export") === "csv";

    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: {
              select: { name: true, category: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (exportCsv) {
      // Build CSV output
      let csv = "Order ID,Customer Name,Email,Total Amount,Payment Method,Status,Created At\n";
      for (const o of orders) {
        csv += `"${o.id}","${o.user?.name ?? ""}","${o.user?.email ?? ""}",${o.totalAmount},"${o.paymentMethod}","${o.status}","${o.createdAt.toISOString()}"\n`;
      }

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="trend_vogue_sales_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Aggregations
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCount = orders.length;
    const avgOrderValue = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

    // Revenue by payment method
    const byPayment: Record<string, number> = {};
    for (const o of orders) {
      byPayment[o.paymentMethod] = (byPayment[o.paymentMethod] || 0) + o.totalAmount;
    }

    return apiSuccess({
      metrics: {
        totalRevenue,
        totalCount,
        avgOrderValue,
        byPayment,
      },
      orders: orders.slice(0, 50),
    });
  } catch (error) {
    console.error("[REPORTS API]", error);
    return apiError("Failed to generate report", 500);
  }
}
