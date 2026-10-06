"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, remove: removeItem, clear: clearWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const handleMoveToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      mrp: item.mrp,
      image: item.image,
      size: "M", // Default fallback size
      quantity: 1,
      stockQty: 50,
    });
    removeItem(item.id);
    toast.success("Moved item to Cart! 🛍️");
  };

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      {/* Header */}
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
              fontSize: "1.85rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            My Wishlist ({items.length})
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Curated styles you've saved for later
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--error)" }}
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card empty-state" style={{ padding: "4.5rem 1rem" }}>
          <Heart size={54} color="var(--text-faint)" />
          <p style={{ fontWeight: 700, fontSize: "1.15rem" }}>Your wishlist is empty</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Explore our collections and heart the designs you love!
          </p>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Start Exploring <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <AnimatePresence>
            {items.map((item) => {
              const discount = calculateDiscount(item.price, item.mrp);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="card"
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  {/* Image container */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      background: "var(--surface-2)",
                    }}
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="240px"
                        style={{ objectFit: "cover" }}
                      />
                    )}

                    {discount >= 10 && (
                      <span
                        className="badge badge-sale"
                        style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}
                      >
                        {discount}% OFF
                      </span>
                    )}

                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        width: "32px",
                        height: "32px",
                        borderRadius: "999px",
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Info & Actions */}
                  <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <Link
                      href={`/product/${item.id}`}
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        marginBottom: "0.5rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </Link>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem" }}>
                        {formatCurrency(item.price)}
                      </span>
                      {item.mrp > item.price && (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-faint)", textDecoration: "line-through" }}>
                          {formatCurrency(item.mrp)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "auto", width: "100%", justifyContent: "center", gap: "0.4rem" }}
                    >
                      <ShoppingBag size={14} /> Move to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
