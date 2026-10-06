"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";

interface StatsData {
  kpis: {
    totalOrders: number;
    totalRevenue: number;
    activeUsers: number;
    lowStockProducts: number;
  };
  recentOrders: any[];
  ordersByStatus: { status: string; count: number }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  topProducts: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      const json = await res.json();
      if (res.ok && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kpis = [
    {
      title: "Total Revenue",
      value: data ? formatCurrency(data.kpis.totalRevenue) : "₹0",
      change: "+18.4% from last mo.",
      icon: DollarSign,
      color: "var(--accent)",
      bg: "var(--accent-subtle)",
    },
    {
      title: "Total Orders",
      value: data ? data.kpis.totalOrders.toString() : "0",
      change: "+12.2% from last mo.",
      icon: ShoppingBag,
      color: "var(--amber)",
      bg: "rgba(240, 136, 4, 0.1)",
    },
    {
      title: "Active Customers",
      value: data ? data.kpis.activeUsers.toString() : "0",
      change: "+8.5% new this mo.",
      icon: Users,
      color: "var(--success)",
      bg: "var(--success-bg)",
    },
    {
      title: "Low Stock Alert",
      value: data ? data.kpis.lowStockProducts.toString() : "0",
      change: "Items with ≤ 5 units",
      icon: AlertTriangle,
      color: "var(--error)",
      bg: "var(--error-bg)",
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Dashboard Overview
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Real-time analytics & store performance metrics
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="btn btn-secondary btn-sm"
          style={{ gap: "0.4rem" }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card"
              style={{ padding: "1.5rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {kpi.title}
                </span>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-md)",
                    background: kpi.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: kpi.color,
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>

              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  marginBottom: "0.35rem",
                }}
              >
                {loading ? "..." : kpi.value}
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: kpi.title === "Low Stock Alert" && data?.kpis.lowStockProducts ? "var(--error)" : "var(--text-faint)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {kpi.title !== "Low Stock Alert" && (
                  <TrendingUp size={12} color="var(--success)" />
                )}
                {kpi.change}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: Orders & Top Products */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Recent Orders */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                }}
              >
                Recent Orders
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Latest transactions from all channels
              </span>
            </div>
            <Link
              href="/admin/orders"
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--accent)", gap: "0.25rem" }}
            >
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: "45px", borderRadius: "var(--radius-md)" }}
                  className="skeleton"
                />
              ))}
            </div>
          ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem 0" }}>
              <Clock size={36} color="var(--text-faint)" />
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                No recent orders placed yet.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--border)",
                      textAlign: "left",
                      color: "var(--text-muted)",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                    }}
                  >
                    <th style={{ padding: "0.625rem 0.5rem" }}>Order ID</th>
                    <th style={{ padding: "0.625rem 0.5rem" }}>Customer</th>
                    <th style={{ padding: "0.625rem 0.5rem" }}>Amount</th>
                    <th style={{ padding: "0.625rem 0.5rem" }}>Status</th>
                    <th style={{ padding: "0.625rem 0.5rem" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 700 }}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          style={{
                            color: "var(--accent)",
                            textDecoration: "none",
                          }}
                        >
                          #{order.id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <div style={{ fontWeight: 600 }}>{order.user?.name ?? "Guest"}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>
                          {order.user?.email}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 700 }}>
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <span
                          className="badge"
                          style={{
                            background:
                              order.status === "DELIVERED"
                                ? "var(--success-bg)"
                                : order.status === "CANCELLED"
                                ? "var(--error-bg)"
                                : "var(--accent-subtle)",
                            color:
                              order.status === "DELIVERED"
                                ? "var(--success)"
                                : order.status === "CANCELLED"
                                ? "var(--error)"
                                : "var(--accent)",
                            fontSize: "0.7rem",
                          }}
                        >
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-faint)", fontSize: "0.75rem" }}>
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 700,
              }}
            >
              Top Performers
            </h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Best sellers by units sold
            </span>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: "50px", borderRadius: "var(--radius-md)" }}
                  className="skeleton"
                />
              ))}
            </div>
          ) : !data?.topProducts || data.topProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem 0" }}>
              <Package size={36} color="var(--text-faint)" />
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                No sales data recorded yet.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {data.topProducts.map((tp, idx) => (
                <div
                  key={tp.productId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    paddingBottom: "0.75rem",
                    borderBottom: idx < data.topProducts.length - 1 ? "1px solid var(--border-light)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      color: idx === 0 ? "var(--amber)" : "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    #{idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tp.product?.name ?? "Product"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                      {tp._sum?.quantity ?? 1} units sold
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--accent)" }}>
                    {tp.product?.price ? formatCurrency(tp.product.price) : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {[
          { title: "Manage Products", desc: "Catalog & inventory control", href: "/admin/products", count: "Catalog" },
          { title: "Review Orders", desc: "Track fulfillment & statuses", href: "/admin/orders", count: "Fulfillment" },
          { title: "Customer Accounts", desc: "Access user roles & details", href: "/admin/users", count: "Users" },
          { title: "Analytics & Reports", desc: "Export financial & sales stats", href: "/admin/reports", count: "Reports" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ textDecoration: "none" }}
          >
            <div
              className="card card-interactive"
              style={{
                padding: "1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {item.desc}
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-faint)" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
