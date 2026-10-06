"use client";

import { useEffect, useState } from "react";
import {
  Download,
  BarChart3,
  TrendingUp,
  CreditCard,
  Banknote,
  DollarSign,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownloadCsv = () => {
    window.open("/api/admin/reports?export=csv", "_blank");
    toast.success("Downloading CSV export...");
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.75rem",
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
            Sales & Financial Reports
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Exportable audit trails, transactional revenue metrics, and averages
          </p>
        </div>

        <button onClick={handleDownloadCsv} className="btn btn-primary" style={{ gap: "0.5rem" }}>
          <Download size={16} />
          Export CSV (Excel)
        </button>
      </div>

      {/* Highlights Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>
            Cumulative Revenue
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800 }}>
            {data ? formatCurrency(data.metrics.totalRevenue) : "..."}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--success)" }}>Delivered & In-transit orders</span>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>
            Total Valid Orders
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800 }}>
            {data ? data.metrics.totalCount : "..."}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>Excludes cancelled transactions</span>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>
            Average Order Value (AOV)
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800 }}>
            {data ? formatCurrency(data.metrics.avgOrderValue) : "..."}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--accent)" }}>Per checkout conversion</span>
        </div>
      </div>

      {/* Payment Split & Sales log */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Payment Methods Breakdown */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            Payment Split
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Banknote size={18} color="var(--amber)" />
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Cash on Delivery</span>
              </div>
              <div style={{ fontWeight: 700 }}>
                {data?.metrics.byPayment?.COD ? formatCurrency(data.metrics.byPayment.COD) : "₹0"}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={18} color="var(--accent)" />
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Prepaid / Online</span>
              </div>
              <div style={{ fontWeight: 700 }}>
                {data?.metrics.byPayment?.ONLINE ? formatCurrency(data.metrics.byPayment.ONLINE) : "₹0"}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Settlements Log */}
        <div className="card" style={{ padding: "1.25rem", overflowX: "auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Latest Order Records
          </h2>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: "45px", borderRadius: "var(--radius-sm)" }} className="skeleton" />
              ))}
            </div>
          ) : !data?.orders || data.orders.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem" }}>
              <FileSpreadsheet size={36} color="var(--text-faint)" />
              <p style={{ fontSize: "0.875rem" }}>No orders to display</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  <th style={{ padding: "0.5rem" }}>Order</th>
                  <th style={{ padding: "0.5rem" }}>Customer</th>
                  <th style={{ padding: "0.5rem" }}>Date</th>
                  <th style={{ padding: "0.5rem", textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.slice(0, 10).map((o: any) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.6rem 0.5rem", fontWeight: 700, color: "var(--accent)" }}>
                      #{o.id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: "0.6rem 0.5rem" }}>{o.user?.name ?? "Customer"}</td>
                    <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-faint)" }}>{formatDate(o.createdAt)}</td>
                    <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: 700 }}>
                      {formatCurrency(o.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
