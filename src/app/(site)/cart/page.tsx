"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQty, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const savings = items.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0);
  const isFreeShipping = subtotal >= 999;

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem", maxWidth: "960px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.85rem", fontWeight: 800, marginBottom: "0.25rem" }}>
        Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Review your items before proceeding to checkout
      </p>

      {items.length === 0 ? (
        <div className="card empty-state" style={{ padding: "4rem 1rem", textAlign: "center" }}>
          <ShoppingBag size={52} color="var(--text-faint)" style={{ margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Your shopping bag is empty</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Explore our curated collections for Men, Women, Kids & Beauty.
          </p>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "2rem", alignItems: "start" }}>
          {/* Items List */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    paddingBottom: "1.25rem",
                    marginBottom: "1.25rem",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <div
                    style={{
                      width: "85px",
                      height: "110px",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      background: "var(--surface-2)",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="85px" style={{ objectFit: "cover" }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/product/${item.id}`}
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item.name}
                    </Link>

                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                      Size: <strong>{item.size}</strong> {item.color ? `· Color: ${item.color}` : ""}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "1rem" }}>{formatCurrency(item.price)}</span>
                      {item.mrp > item.price && (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-faint)", textDecoration: "line-through" }}>
                          {formatCurrency(item.mrp)}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() => updateQty(item.id, item.size, item.color, item.quantity - 1)}
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "var(--surface-2)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ width: "36px", textAlign: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.size, item.color, item.quantity + 1)}
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "var(--surface-2)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--error)" }}
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary Card */}
          <div className="card" style={{ padding: "1.5rem", position: "sticky", top: "90px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem" }}>
              Order Summary
            </h2>

            {savings > 0 && (
              <div
                style={{
                  background: "var(--success-bg)",
                  color: "var(--success)",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                🎉 You are saving {formatCurrency(savings)} on this order!
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Bag Total</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Delivery</span>
              <span style={{ color: isFreeShipping ? "var(--success)" : "inherit", fontWeight: 600 }}>
                {isFreeShipping ? "FREE" : "₹99"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid var(--border)",
                paddingTop: "0.75rem",
                marginTop: "0.75rem",
                marginBottom: "1.5rem",
                fontWeight: 800,
                fontSize: "1.2rem",
                fontFamily: "var(--font-display)",
              }}
            >
              <span>Total Payable</span>
              <span>{formatCurrency(subtotal + (isFreeShipping ? 0 : 99))}</span>
            </div>

            <Link href="/checkout" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              <ShieldCheck size={18} /> Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
