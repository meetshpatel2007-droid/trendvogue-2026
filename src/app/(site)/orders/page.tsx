"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  product: { name: string; images: string[] };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  estimatedDelivery: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setOrders(d.data?.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    ORDERED:          { bg: "var(--accent-subtle)",  text: "var(--accent)" },
    PACKED:           { bg: "rgba(240,136,4,0.12)",  text: "var(--amber)" },
    SHIPPED:          { bg: "rgba(240,136,4,0.12)",  text: "var(--amber)" },
    OUT_FOR_DELIVERY: { bg: "rgba(27,127,79,0.12)",  text: "var(--success)" },
    DELIVERED:        { bg: "var(--success-bg)",     text: "var(--success)" },
    CANCELLED:        { bg: "var(--error-bg)",       text: "var(--error)" },
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "800px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>My Orders</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Track and manage your orders</p>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: "120px", borderRadius: "var(--radius-lg)" }} className="skeleton" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Package size={52} strokeWidth={1.2} />
          <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>No orders yet</p>
          <p style={{ fontSize: "0.875rem" }}>When you place an order, it will appear here</p>
          <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {orders.map((order, i) => {
            const statusStyle = STATUS_COLORS[order.status] ?? STATUS_COLORS.ORDERED;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/orders/${order.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div className="card card-interactive" style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginBottom: "0.25rem" }}>
                          Order #{order.id.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{formatCurrency(order.totalAmount)}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}>
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </span>
                        <ChevronRight size={16} color="var(--text-faint)" />
                      </div>
                    </div>

                    {/* Items preview */}
                    <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} style={{ position: "relative", width: "56px", height: "70px", borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0, background: "var(--surface-2)" }}>
                          {item.product.images[0] && (
                            <Image src={item.product.images[0]} alt={item.product.name} fill sizes="56px" style={{ objectFit: "cover" }} />
                          )}
                          {item.quantity > 1 && (
                            <div style={{ position: "absolute", bottom: 0, right: 0, background: "var(--accent)", color: "white", fontSize: "0.6rem", fontWeight: 700, padding: "1px 4px", borderRadius: "4px 0 0 0" }}>
                              ×{item.quantity}
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div style={{ width: "56px", height: "70px", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", flexShrink: 0 }}>
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
