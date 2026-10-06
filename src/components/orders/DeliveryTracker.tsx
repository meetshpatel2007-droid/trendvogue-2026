"use client";

import { motion } from "framer-motion";
import { Package, PackageCheck, Truck, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_STEPS, ORDER_STATUS_LABELS } from "@/lib/utils";

interface DeliveryTrackerProps {
  status: string;
  estimatedDelivery: string;
  createdAt: string;
  tier?: string;
}

const STEP_ICONS = [Package, PackageCheck, Truck, MapPin, CheckCircle2];

export function DeliveryTracker({ status, estimatedDelivery, createdAt, tier }: DeliveryTrackerProps) {
  const isCancelled  = status === "CANCELLED";
  const currentIdx   = ORDER_STATUS_STEPS.indexOf(status as any);

  return (
    <div>
      {/* Delivery date banner */}
      {!isCancelled && (
        <div style={{
          background: "linear-gradient(135deg, var(--accent-subtle), rgba(255,216,20,0.08))",
          border: "1px solid rgba(33,98,161,0.2)",
          borderRadius: "var(--radius-lg)",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
              {tier === "metro" ? "⚡ Express Delivery" : "🚚 Standard Delivery"}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>
              Arriving by {formatDate(estimatedDelivery)}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Order placed on {formatDate(createdAt)}
            </div>
          </div>
          <div style={{
            background: "var(--gradient-gold)",
            color: "#0F1111",
            padding: "0.375rem 1rem",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "0.8rem",
          }}>
            {ORDER_STATUS_LABELS[status] ?? status}
          </div>
        </div>
      )}

      {isCancelled ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          padding: "1rem 1.25rem",
          background: "var(--error-bg)",
          border: "1px solid var(--error)",
          borderRadius: "var(--radius-lg)",
        }}>
          <XCircle size={24} color="var(--error)" />
          <div>
            <div style={{ fontWeight: 700, color: "var(--error)" }}>Order Cancelled</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Your refund (if applicable) will be processed within 5–7 business days.
            </div>
          </div>
        </div>
      ) : (
        /* Step tracker */
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          position: "relative",
          gap: 0,
          overflowX: "auto",
          paddingBottom: "0.5rem",
        }}>
          {ORDER_STATUS_STEPS.map((step, i) => {
            const isDone   = i <= currentIdx;
            const isActive = i === currentIdx;
            const Icon     = STEP_ICONS[i];

            return (
              <div key={step} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
                minWidth: "80px",
              }}>
                {/* Connecting line */}
                {i < ORDER_STATUS_STEPS.length - 1 && (
                  <div style={{
                    position: "absolute",
                    top: "20px",
                    left: "50%",
                    width: "100%",
                    height: "2px",
                    background: i < currentIdx ? "var(--accent)" : "var(--border)",
                    transition: "background 0.5s ease",
                    zIndex: 0,
                  }}>
                    {i < currentIdx && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, delay: i * 0.15 }}
                        style={{
                          height: "100%",
                          background: "var(--gradient-accent)",
                          transformOrigin: "left",
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Dot */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ repeat: isActive ? Infinity : 0, repeatType: "reverse", duration: 1 }}
                  className={`tracker-dot ${isDone ? (isActive ? "tracker-dot-active" : "tracker-dot-done") : "tracker-dot-future"}`}
                  style={{ position: "relative", zIndex: 1 }}
                >
                  <Icon size={16} />
                </motion.div>

                {/* Label */}
                <div style={{
                  marginTop: "0.5rem",
                  textAlign: "center",
                  fontSize: "0.7rem",
                  fontWeight: isDone ? 700 : 400,
                  color: isDone ? "var(--text-primary)" : "var(--text-faint)",
                  lineHeight: 1.3,
                  maxWidth: "80px",
                }}>
                  {ORDER_STATUS_LABELS[step]}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
