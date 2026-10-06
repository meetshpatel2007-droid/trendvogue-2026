"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Loader2, Phone, Mail, MapPin } from "lucide-react";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, { credentials: "include" });
      const json = await res.json();
      if (res.ok && json.data) {
        setOrder(json.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Order status updated to ${ORDER_STATUS_LABELS[newStatus]}`);
        fetchOrder();
      } else {
        const json = await res.json();
        toast.error(json.error ?? "Failed to update");
      }
    } catch {
      toast.error("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ height: "400px", borderRadius: "var(--radius-lg)" }} className="skeleton" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="empty-state" style={{ padding: "3rem" }}>
        <p>Order not found</p>
        <Link href="/admin/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.addressSnap ?? {};
  const ALL_STATUSES = ["ORDERED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: "0.85rem",
            marginBottom: "0.75rem",
          }}
        >
          <ArrowLeft size={15} /> Back to Orders
        </Link>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Placed on {formatDate(order.createdAt)} by {order.user?.name}
            </p>
          </div>

          {/* Quick status updater */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Change Status:</span>
            <select
              value={order.status}
              disabled={updating}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              style={{ minWidth: "160px", height: "38px", fontWeight: 700 }}
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {ORDER_STATUS_LABELS[st] ?? st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.75rem", alignItems: "start" }}>
        {/* Main Details: Items & Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Items Card */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "1.25rem",
              }}
            >
              Purchased Line Items ({order.items?.length ?? 0})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <div
                    style={{
                      width: "55px",
                      height: "70px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      position: "relative",
                      background: "var(--surface-2)",
                      flexShrink: 0,
                    }}
                  >
                    {item.product?.images?.[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="55px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                      {item.product?.name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Size: <strong>{item.size}</strong> {item.color ? `· Color: ${item.color}` : ""}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                      {formatCurrency(item.price)} × {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Shipping Fee</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>Free</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  marginTop: "0.75rem",
                  borderTop: "1px solid var(--border)",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  fontFamily: "var(--font-display)",
                }}
              >
                <span>Total Received / Due</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Customer & Shipping */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Customer info */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.875rem" }}>
              Customer Details
            </h3>
            <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ fontWeight: 700 }}>{order.user?.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)" }}>
                <Mail size={14} /> {order.user?.email}
              </div>
              {order.user?.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-secondary)" }}>
                  <Phone size={14} /> {order.user.phone}
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Snapshot */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.875rem" }}>
              Delivery Destination
            </h3>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{addr.name}</div>
              {addr.line1}<br />
              {addr.line2 && <>{addr.line2}<br /></>}
              {addr.city}, {addr.state} – {addr.pincode}<br />
              📞 {addr.phone}
            </div>
            {order.pincodeDeliveryTier && (
              <div
                style={{
                  marginTop: "0.75rem",
                  padding: "0.4rem 0.6rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--accent-subtle)",
                  color: "var(--accent)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                Tier: {order.pincodeDeliveryTier.toUpperCase()}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.875rem" }}>
              Payment Information
            </h3>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.8 }}>
              <div>
                Method: <strong>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</strong>
              </div>
              <div>
                Status:{" "}
                <span
                  style={{
                    fontWeight: 700,
                    color: order.paymentStatus === "PAID" ? "var(--success)" : "var(--amber)",
                  }}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
