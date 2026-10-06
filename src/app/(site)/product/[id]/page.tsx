"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingCart, Star, ChevronLeft, ChevronRight,
  Truck, RefreshCw, ShieldCheck, Share2, Minus, Plus, Loader2
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, calculateDiscount, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { use } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stockQty: number;
  isActive: boolean;
  category: { name: string; slug: string };
  reviews: Review[];
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct]       = useState<Product | null>(null);
  const [loading, setLoading]       = useState(true);
  const [imgIdx, setImgIdx]         = useState(0);
  const [selectedSize, setSize]     = useState<string>("");
  const [selectedColor, setColor]   = useState<string>("");
  const [qty, setQty]               = useState(1);
  const [addingToCart, setAdding]   = useState(false);

  const addItem    = useCartStore((s) => s.addItem);
  const { toggle, isInWishlist } = useWishlistStore();
  const user       = useAuthStore((s) => s.user);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d.data?.product ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (product) {
      setSize(product.sizes[0] ?? "");
      setColor(product.colors[0] ?? "");
    }
  }, [product]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          <div style={{ aspectRatio: "3/4" }} className="skeleton" />
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: i === 0 ? "48px" : "24px", borderRadius: "8px" }} className="skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container empty-state" style={{ paddingTop: "4rem" }}>
        <p style={{ fontWeight: 600 }}>Product not found</p>
        <Link href="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const discount    = calculateDiscount(product.price, product.mrp);
  const wishlisted  = isInWishlist(product.id);
  const inStock     = product.stockQty > 0;
  const avgRating   = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const handleAddToCart = async () => {
    if (!inStock) return;
    if (!selectedSize) { toast.error("Please select a size"); return; }
    setAdding(true);
    await new Promise((r) => setTimeout(r, 400));
    addItem({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      mrp:      product.mrp,
      image:    product.images[0] ?? "",
      size:     selectedSize,
      color:    selectedColor || undefined,
      quantity: qty,
      stockQty: product.stockQty,
    });
    toast.success("Added to cart! 🛍️");
    setAdding(false);
  };

  const handleWishlist = () => {
    toggle({
      id:           product.id,
      name:         product.name,
      price:        product.price,
      mrp:          product.mrp,
      image:        product.images[0] ?? "",
      categorySlug: product.category.slug,
    });
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      {/* Breadcrumb */}
      <nav style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-faint)", marginBottom: "2rem" }}>
        <Link href="/" style={{ textDecoration: "none", color: "var(--text-faint)" }}>Home</Link>
        <span>/</span>
        <Link href={`/shop/${product.category.slug}`} style={{ textDecoration: "none", color: "var(--text-faint)" }}>
          {product.category.name}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{product.name}</span>
      </nav>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3rem",
        alignItems: "start",
      }}>
        {/* LEFT: Images */}
        <div>
          {/* Main image */}
          <div style={{
            position: "relative",
            aspectRatio: "3/4",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            background: "var(--surface-2)",
            marginBottom: "0.875rem",
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={imgIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: "absolute", inset: 0 }}
              >
                {product.images[imgIdx] && (
                  <Image
                    src={product.images[imgIdx]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Prev/Next */}
            {product.images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                  disabled={imgIdx === 0}
                  style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "rgba(15,17,17,0.7)", border: "none", borderRadius: "999px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", opacity: imgIdx === 0 ? 0.3 : 1 }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setImgIdx((i) => Math.min(product.images.length - 1, i + 1))}
                  disabled={imgIdx === product.images.length - 1}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "rgba(15,17,17,0.7)", border: "none", borderRadius: "999px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", opacity: imgIdx === product.images.length - 1 ? 0.3 : 1 }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Badges */}
            {discount >= 10 && (
              <span className="badge badge-sale" style={{ position: "absolute", top: "1rem", left: "1rem" }}>
                {discount}% OFF
              </span>
            )}
            {!inStock && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="badge badge-out" style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  style={{
                    width: "72px", height: "90px",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    position: "relative",
                    border: `2px solid ${i === imgIdx ? "var(--accent)" : "var(--border)"}`,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}>
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="72px" style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product info */}
        <div style={{ position: "sticky", top: "80px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {product.category.name}
          </div>

          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontFamily: "var(--font-display)", marginBottom: "0.75rem", lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Rating */}
          {product.reviews.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16}
                    fill={i < Math.round(avgRating) ? "var(--highlight)" : "transparent"}
                    color={i < Math.round(avgRating) ? "var(--highlight)" : "var(--border)"}
                  />
                ))}
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{avgRating.toFixed(1)}</span>
              <span style={{ color: "var(--text-faint)", fontSize: "0.8rem" }}>({product.reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "var(--text-primary)" }}>
              {formatCurrency(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span style={{ textDecoration: "line-through", color: "var(--text-faint)", fontSize: "1.1rem" }}>
                  {formatCurrency(product.mrp)}
                </span>
                <span style={{
                  background: "var(--gradient-gold)",
                  color: "#0F1111",
                  padding: "2px 10px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}>
                  {discount}% off
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          {inStock ? (
            <p style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem" }}>
              ✓ In Stock ({product.stockQty} available)
            </p>
          ) : (
            <p style={{ color: "var(--error)", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1rem" }}>
              ✗ Out of Stock
            </p>
          )}

          <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.25rem" }} />

          {/* Colors */}
          {product.colors.length > 0 && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.625rem" }}>
                Colour: <span style={{ color: "var(--accent)" }}>{selectedColor}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    style={{
                      padding: "0.375rem 0.875rem",
                      border: `2px solid ${selectedColor === color ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.8rem",
                      fontWeight: selectedColor === color ? 700 : 400,
                      background: selectedColor === color ? "var(--accent-subtle)" : "transparent",
                      color: selectedColor === color ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.625rem" }}>
                Size: <span style={{ color: "var(--accent)" }}>{selectedSize}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSize(size)}
                    style={{
                      width: "52px", height: "44px",
                      border: `2px solid ${selectedSize === size ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.8rem",
                      fontWeight: selectedSize === size ? 700 : 400,
                      background: selectedSize === size ? "var(--accent-subtle)" : "transparent",
                      color: selectedSize === size ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Qty:</span>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ width: "40px", height: "40px", background: "var(--surface-2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                <Minus size={14} />
              </button>
              <span style={{ width: "44px", textAlign: "center", fontWeight: 700, fontSize: "1rem" }}>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stockQty, qty + 1))}
                disabled={qty >= product.stockQty}
                style={{ width: "40px", height: "40px", background: "var(--surface-2)", border: "none", cursor: qty >= product.stockQty ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", opacity: qty >= product.stockQty ? 0.4 : 1 }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <button
              id="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
            >
              {addingToCart ? (
                <><Loader2 size={18} className="animate-spin" /> Adding...</>
              ) : (
                <><ShoppingCart size={18} /> {inStock ? "Add to Cart" : "Out of Stock"}</>
              )}
            </button>
            <button
              onClick={handleWishlist}
              className={wishlisted ? "btn btn-danger btn-lg" : "btn btn-secondary btn-lg"}
              style={{ width: "54px", padding: "0", justifyContent: "center" }}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
              DESCRIPTION
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.9rem" }}>
              {product.description}
            </p>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {[
              { Icon: Truck,       text: "Free delivery on orders above ₹999" },
              { Icon: RefreshCw,   text: "30-day easy returns & exchanges" },
              { Icon: ShieldCheck, text: "100% authentic product guarantee" },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <Icon size={15} color="var(--accent)" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: "4rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "2rem" }}>
          Customer Reviews ({product.reviews.length})
        </h2>

        {product.reviews.length === 0 ? (
          <div className="empty-state" style={{ padding: "2rem" }}>
            <Star size={36} strokeWidth={1.2} />
            <p>No reviews yet. Be the first to review this product!</p>
            {!user && (
              <Link href="/login" className="btn btn-primary btn-sm">Login to Review</Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {product.reviews.map((review) => (
              <div key={review.id} className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{review.user.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>{formatDate(review.createdAt)}</div>
                  </div>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14}
                        fill={i < review.rating ? "var(--highlight)" : "transparent"}
                        color={i < review.rating ? "var(--highlight)" : "var(--border)"}
                      />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
