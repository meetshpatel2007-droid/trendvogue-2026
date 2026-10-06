"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeliveryTracker } from "@/components/orders/DeliveryTracker";
import { toast } from "sonner";
import { use } from "react";

interface Order {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  estimatedDelivery: string;
  pincodeDeliveryTier: string;
  createdAt: string;
  addressSnap: Record<string, string>;
  items: {
    id: string;
    quantity: number;
    price: number;
    size: string;
    product: { id: string; name: string; images: string[] };
  }[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder]     = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => {
    fetch(`/api/orders/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setOrder(d.data?.order ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Order cancelled successfully");
      fetchOrder();
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Failed to cancel");
    }
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "3rem" }}>
        <div style={{ height: "400px" }} className="skeleton" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container empty-state" style={{ paddingTop: "4rem" }}>
        <p>Order not found</p>
        <Link href="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const addr = order.addressSnap;
  const canCancel = ["ORDERED", "PACKED"].includes(order.status);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "800px" }}>
      <Link href="/orders" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        <ArrowLeft size={15} /> Back to Orders
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Placed on {formatDate(order.createdAt)}</p>
        </div>
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn btn-danger btn-sm"
          >
            {cancelling ? <><Loader2 size={14} className="animate-spin" /> Cancelling...</> : <><XCircle size={14} /> Cancel Order</>}
          </button>
        )}
      </div>

      {/* Delivery Tracker */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <DeliveryTracker
          status={order.status}
          estimatedDelivery={order.estimatedDelivery}
          createdAt={order.createdAt}
          tier={order.pincodeDeliveryTier}
        />
      </div>

      {/* Order Items */}
      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>Items ({order.items.length})</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {order.items.map((item) => (
            <div key={item.id} style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
              <div style={{ width: "60px", height: "76px", borderRadius: "var(--radius-md)", overflow: "hidden", flexShrink: 0, position: "relative", background: "var(--surface-2)" }}>
                {item.product.images[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill sizes="60px" style={{ objectFit: "cover" }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/product/${item.product.id}`} style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", textDecoration: "none", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.product.name}
                </Link>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Size: {item.size} · Qty: {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginTop: "1rem", paddingTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Subtotal</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Delivery</span>
            <span style={{ color: "var(--success)", fontWeight: 600 }}>Free</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem" }}>
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping & Payment info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.875rem" }}>Delivery Address</h3>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
            {addr.line1}<br />
            {addr.line2 && <>{addr.line2}<br /></>}
            {addr.city}, {addr.state} – {addr.pincode}<br />
            📞 {addr.phone}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.875rem" }}>Payment Info</h3>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
            Method: <strong>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</strong><br />
            Status: <span style={{ color: order.paymentStatus === "PAID" ? "var(--success)" : "var(--amber)", fontWeight: 600 }}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
