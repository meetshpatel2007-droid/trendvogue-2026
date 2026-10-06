"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    images: string[];
    sizes: string[];
    colors: string[];
    stockQty: number;
    isActive: boolean;
    category?: { name: string; slug: string };
    reviews?: { rating: number }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  const discount  = calculateDiscount(product.price, product.mrp);
  const image     = imgError ? "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400" : (product.images[0] ?? "");
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockQty === 0) { toast.error("Out of stock"); return; }
    addItem({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      mrp:      product.mrp,
      image:    product.images[0] ?? "",
      size:     product.sizes[0] ?? "Free Size",
      stockQty: product.stockQty,
    });
    toast.success("Added to cart!");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      id:           product.id,
      name:         product.name,
      price:        product.price,
      mrp:          product.mrp,
      image:        product.images[0] ?? "",
      categorySlug: product.category?.slug ?? "",
    });
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.id}`} style={{ textDecoration: "none", display: "block" }}>
        <div className="card card-interactive" style={{ overflow: "hidden" }}>
          {/* Image */}
          <div style={{
            position: "relative",
            aspectRatio: "3/4",
            overflow: "hidden",
            background: "var(--surface-2)",
          }}>
            {image && (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={{
                  objectFit: "cover",
                  transform: hovered ? "scale(1.06)" : "scale(1)",
                  transition: "transform 0.5s ease",
                }}
                onError={() => setImgError(true)}
              />
            )}

            {/* Badges */}
            <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {discount >= 10 && (
                <span className="badge badge-sale">{discount}% OFF</span>
              )}
              {product.stockQty === 0 && (
                <span className="badge badge-out">Out of Stock</span>
              )}
              {product.stockQty > 0 && product.stockQty <= 5 && (
                <span className="badge" style={{ background: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error)" }}>
                  Only {product.stockQty} left
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: hovered || wishlisted ? 1 : 0, scale: hovered || wishlisted ? 1 : 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                width: "36px",
                height: "36px",
                borderRadius: "999px",
                background: wishlisted ? "var(--error)" : "rgba(15,17,17,0.7)",
                backdropFilter: "blur(8px)",
                border: "none",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={16} fill={wishlisted ? "white" : "none"} />
            </motion.button>

            {/* Add to cart overlay */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={product.stockQty === 0}
              style={{
                position: "absolute",
                bottom: "0.75rem",
                left: "0.75rem",
                right: "0.75rem",
                padding: "0.625rem",
                background: product.stockQty === 0 ? "rgba(100,100,100,0.8)" : "rgba(33,98,161,0.92)",
                backdropFilter: "blur(8px)",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "white",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: product.stockQty === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
              aria-label="Quick add to cart"
            >
              <ShoppingCart size={14} />
              {product.stockQty === 0 ? "Out of Stock" : "Quick Add"}
            </motion.button>
          </div>

          {/* Info */}
          <div style={{ padding: "0.875rem" }}>
            {product.category && (
              <div style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: "0.25rem",
              }}>
                {product.category.name}
              </div>
            )}

            <div style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {product.name}
            </div>

            {/* Rating */}
            {avgRating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <Star size={12} fill="var(--highlight)" color="var(--highlight)" />
                <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{avgRating.toFixed(1)}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                  ({product.reviews?.length})
                </span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span className="price-current">{formatCurrency(product.price)}</span>
              {product.mrp > product.price && (
                <span className="price-mrp">{formatCurrency(product.mrp)}</span>
              )}
              {discount >= 10 && (
                <span className="price-discount">{discount}% off</span>
              )}
            </div>

            {/* Sizes preview */}
            {product.sizes.length > 0 && (
              <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.625rem", flexWrap: "wrap" }}>
                {product.sizes.slice(0, 4).map((size) => (
                  <span
                    key={size}
                    style={{
                      padding: "1px 6px",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "var(--text-faint)",
                    }}
                  >
                    {size}
                  </span>
                ))}
                {product.sizes.length > 4 && (
                  <span style={{ fontSize: "0.65rem", color: "var(--text-faint)", alignSelf: "center" }}>
                    +{product.sizes.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
