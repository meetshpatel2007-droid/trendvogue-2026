"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency, calculateDiscount } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeDrawer, updateQty, removeItem, getSubtotal } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeDrawer]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const subtotal = getSubtotal();
  const savings  = items.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            style={{
              position: "fixed",
              inset: 0,
              background: "var(--overlay)",
              zIndex: 600,
            }}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(420px, 100vw)",
              background: "var(--surface)",
              borderLeft: "1px solid var(--border)",
              zIndex: 700,
              display: "flex",
              flexDirection: "column",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <ShoppingBag size={20} color="var(--accent)" />
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>
                  Cart
                </h2>
                <span style={{
                  background: "var(--accent)",
                  color: "white",
                  borderRadius: "999px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "1px 8px",
                }}>
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <button onClick={closeDrawer} className="btn btn-ghost btn-sm" style={{ padding: "0.5rem" }} aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
              {items.length === 0 ? (
                <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                  <ShoppingBag size={48} strokeWidth={1.2} />
                  <p style={{ fontWeight: 600, fontSize: "1rem" }}>Your cart is empty</p>
                  <p style={{ fontSize: "0.875rem" }}>Add items to get started</p>
                  <Link href="/shop" onClick={closeDrawer} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
                    Shop Now
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40, height: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        display: "flex",
                        gap: "0.875rem",
                        paddingBottom: "1rem",
                        marginBottom: "1rem",
                        borderBottom: "1px solid var(--border-light)",
                      }}
                    >
                      {/* Image */}
                      <div style={{
                        width: "80px",
                        height: "100px",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "var(--surface-2)",
                        position: "relative",
                      }}>
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          href={`/product/${item.id}`}
                          onClick={closeDrawer}
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "var(--text-primary)",
                            textDecoration: "none",
                            display: "block",
                            marginBottom: "0.25rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.name}
                        </Link>

                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                          Size: {item.size}
                          {item.color ? ` · ${item.color}` : ""}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                            {formatCurrency(item.price)}
                          </span>
                          {item.mrp > item.price && (
                            <span style={{ textDecoration: "line-through", color: "var(--text-faint)", fontSize: "0.8rem" }}>
                              {formatCurrency(item.mrp)}
                            </span>
                          )}
                        </div>

                        {/* Qty Controls */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            overflow: "hidden",
                          }}>
                            <button
                              onClick={() => updateQty(item.id, item.size, item.color, item.quantity - 1)}
                              style={{
                                width: "30px", height: "30px",
                                background: "var(--surface-2)",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.15s",
                              }}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{
                              width: "32px",
                              textAlign: "center",
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, item.size, item.color, item.quantity + 1)}
                              disabled={item.quantity >= item.stockQty}
                              style={{
                                width: "30px", height: "30px",
                                background: "var(--surface-2)",
                                border: "none",
                                cursor: item.quantity >= item.stockQty ? "not-allowed" : "pointer",
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: item.quantity >= item.stockQty ? 0.4 : 1,
                              }}
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id, item.size, item.color)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--error)",
                              cursor: "pointer",
                              padding: "0.25rem",
                              opacity: 0.7,
                              transition: "opacity 0.2s",
                            }}
                            aria-label="Remove item"
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{
                padding: "1.25rem 1.5rem",
                borderTop: "1px solid var(--border)",
                flexShrink: 0,
                background: "var(--surface)",
              }}>
                {savings > 0 && (
                  <div style={{
                    background: "var(--success-bg)",
                    border: "1px solid rgba(27,127,79,0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.8rem",
                    color: "var(--success)",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}>
                    🎉 You're saving {formatCurrency(savings)} on this order!
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Subtotal</span>
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>{formatCurrency(subtotal)}</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginBottom: "1rem" }}>
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                  id="cart-checkout-btn"
                >
                  Checkout <ArrowRight size={16} />
                </Link>
                <button
                  onClick={closeDrawer}
                  className="btn btn-ghost"
                  style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
