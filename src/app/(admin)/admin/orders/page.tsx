"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from "@/lib/utils";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
}

function OrdersListContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const res = await fetch(`/api/orders?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setOrders(json.data.orders);
        setTotalPages(json.data.pagination.pages);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Order #${orderId.slice(-6).toUpperCase()} updated to ${ORDER_STATUS_LABELS[newStatus]}`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        const json = await res.json();
        toast.error(json.error ?? "Failed to update status");
      }
    } catch {
      toast.error("Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const ALL_STATUSES = ["ORDERED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Orders Management
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Track, process, and update shipping progress for all customer purchases
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
        }}
      >
        <button
          onClick={() => {
            setStatusFilter("");
            setPage(1);
          }}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-full)",
            border: `1.5px solid ${!statusFilter ? "var(--accent)" : "var(--border)"}`,
            background: !statusFilter ? "var(--accent-subtle)" : "var(--surface)",
            color: !statusFilter ? "var(--accent)" : "var(--text-secondary)",
            fontWeight: !statusFilter ? 700 : 500,
            fontSize: "0.8rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          All Orders
        </button>
        {ALL_STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-full)",
              border: `1.5px solid ${statusFilter === st ? "var(--accent)" : "var(--border)"}`,
              background: statusFilter === st ? "var(--accent-subtle)" : "var(--surface)",
              color: statusFilter === st ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: statusFilter === st ? 700 : 500,
              fontSize: "0.8rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {ORDER_STATUS_LABELS[st] ?? st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: "0.5rem", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: "60px", borderRadius: "var(--radius-md)" }} className="skeleton" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: "3.5rem 1rem" }}>
            <ShoppingBag size={42} color="var(--text-faint)" />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No orders matching filter</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
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
                <th style={{ padding: "0.75rem 1rem" }}>Order ID</th>
                <th style={{ padding: "0.75rem 1rem" }}>Customer</th>
                <th style={{ padding: "0.75rem 1rem" }}>Items</th>
                <th style={{ padding: "0.75rem 1rem" }}>Total</th>
                <th style={{ padding: "0.75rem 1rem" }}>Payment</th>
                <th style={{ padding: "0.75rem 1rem" }}>Status & Action</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      style={{
                        fontWeight: 700,
                        color: "var(--accent)",
                        textDecoration: "none",
                      }}
                    >
                      #{o.id.slice(-6).toUpperCase()}
                    </Link>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>
                      {formatDate(o.createdAt)}
                    </div>
                  </td>

                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontWeight: 600 }}>{o.user?.name ?? "Guest"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                      {o.user?.email}
                    </div>
                  </td>

                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontWeight: 600 }}>{o.items?.length ?? 0} item(s)</div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-faint)",
                        maxWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {o.items?.map((i) => i.product?.name).join(", ")}
                    </div>
                  </td>

                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>
                    {formatCurrency(o.totalAmount)}
                  </td>

                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      {o.paymentMethod === "COD" ? "Cash on Delivery" : "Online"}
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: o.paymentStatus === "PAID" ? "var(--success)" : "var(--amber)",
                      }}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>

                  <td style={{ padding: "0.75rem 1rem" }}>
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      style={{
                        height: "32px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        borderRadius: "var(--radius-sm)",
                        padding: "0 0.5rem",
                        background:
                          o.status === "DELIVERED"
                            ? "var(--success-bg)"
                            : o.status === "CANCELLED"
                            ? "var(--error-bg)"
                            : "var(--surface-2)",
                        color:
                          o.status === "DELIVERED"
                            ? "var(--success)"
                            : o.status === "CANCELLED"
                            ? "var(--error)"
                            : "var(--text-primary)",
                      }}
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {ORDER_STATUS_LABELS[st] ?? st}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.35rem 0.65rem", gap: "0.25rem" }}
                    >
                      View <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={p === page ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersListContent />
    </Suspense>
  );
}
