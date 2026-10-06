"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Sparkles,
  Truck,
  RefreshCw,
  ShieldCheck,
  Zap,
  Star,
  Search,
  CheckCircle2,
  Box,
  MapPin,
  Heart,
  ChevronDown,
  Copy,
  Clock,
  Award,
  Send,
  HelpCircle,
  Scissors,
  Feather,
  Globe2,
} from "lucide-react";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Product {
  id: string;
  name: string;
  category: { name: string; slug: string };
  price: number;
  mrp: number;
  images: string[];
  stockQty: number;
  reviews?: { rating: number }[];
}

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("featured");

  // Live order tracker demo status
  const [trackerStatus, setTrackerStatus] = useState<string>("SHIPPED");

  // FAQ Accordion State (open index)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Newsletter email state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 48, seconds: 32 });

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetch("/api/products?limit=12")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.products) {
          setProducts(d.data.products);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Countdown tick
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp,
      image: p.images[0] ?? "",
      size: "M",
      quantity: 1,
      stockQty: p.stockQty,
    });
    toast.success(`Added "${p.name}" to cart! 🛍️`);
  };

  const handleToggleWishlist = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      id: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp,
      image: p.images[0] ?? "",
      categorySlug: p.category?.slug ?? "all",
    });
    const active = isInWishlist(p.id);
    toast(active ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    toast.success(`Coupon "${code}" copied to clipboard!`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setNewsletterSubscribed(true);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    toast.success("Welcome to Trend Vogue VIP Club! 20% discount unlocked.");
  };

  // Filtered and sorted products
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      activeCategory === "all" ||
      p.category?.slug?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (sortOption === "price_asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === "price_desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // Delivery tracker calculation
  const TRACKER_STEPS = ["ORDERED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStepIdx = TRACKER_STEPS.indexOf(trackerStatus);
  const progressPercent = (currentStepIdx / (TRACKER_STEPS.length - 1)) * 100;

  // FAQ Data List
  const FAQ_ITEMS = [
    {
      q: "How does the Deterministic Delivery Pipeline calculate my arrival date?",
      a: "Our logistics engine queries live Indian postal routing matrices. Metro PIN codes (such as Mumbai, Delhi NCR, and Bengaluru) receive priority 2-day air dispatch via BlueDart Air, while Tier-2 regional hubs automatically route via 4-day express surface transit with milestone GPS scanning.",
    },
    {
      q: "What is the 30-Day Easy Return & Refund policy?",
      a: "We offer a 100% risk-free 30-day return window on all unworn items with original tags attached. Simply navigate to your Profile > Orders page, click 'Return Item', and our courier partner will complete doorstep pickup within 24 hours with zero return fees.",
    },
    {
      q: "Are Trend Vogue garments certified sustainable and organic?",
      a: "Yes. Every piece in our collection is crafted with GOTS-certified 100% organic cotton, ethically harvested mulberry silk, and recycled natural horn or corozo nut buttons. We strictly reject fast-fashion petrochemical synthetics.",
    },
    {
      q: "Can I pay using Cash on Delivery (COD) or UPI?",
      a: "Absolutely. We support Instant UPI (Google Pay, PhonePe, Paytm), All Major Credit/Debit Cards, NetBanking, and Cash on Delivery (COD) with zero additional surcharge.",
    },
    {
      q: "How do I ensure I select the perfect size and fit?",
      a: "Every product page features a detailed interactive Size Guide with precise chest, waist, and length measurements in both inches and centimeters, along with model height references to ensure a tailored bespoke fit.",
    },
    {
      q: "How do administrators access the back-office CMS?",
      a: "Authorized administrators can sign in using their verified credentials. The system automatically reads the user role from the database JWT payload and routes administrators straight to the executive CMS dashboard at /admin.",
    },
  ];

  return (
    <div style={{ position: "relative", overflowX: "hidden" }}>
      {/* ── 0. TOP PROMO BANNER ─────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(90deg, #1B4F82 0%, #2162A1 50%, #1B4F82 100%)",
          color: "#FFFFFF",
          padding: "0.5rem 1rem",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span>✨ MONSOON COUTURE: FLAT 50% OFF WITH CODE <strong>"VOGUE50"</strong></span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span>FREE METRO DELIVERY OVER ₹999</span>
        <button
          onClick={() => copyPromoCode("VOGUE50")}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.4)",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.7rem",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          COPY CODE
        </button>
      </div>

      {/* ── Ambient Radial Background Glows ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "-5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1200px",
          height: "700px",
          background: "radial-gradient(ellipse at 50% 30%, rgba(33, 98, 161, 0.22) 0%, rgba(240, 136, 4, 0.08) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── 1. LUXURY EDITORIAL HERO ────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "clamp(80px, 10vw, 130px)",
          paddingBottom: "clamp(60px, 8vw, 110px)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "clamp(2.5rem, 5vw, 5rem)",
              alignItems: "center",
            }}
          >
            {/* Left: Headline & Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 1rem",
                  background: "rgba(255, 216, 20, 0.08)",
                  border: "1px solid rgba(255, 216, 20, 0.25)",
                  borderRadius: "var(--radius-full)",
                  color: "var(--highlight)",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                }}
              >
                <Zap size={14} />
                Monsoon Edition 2026
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.8rem, 6vw, 4.6rem)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.035em",
                  marginBottom: "1.5rem",
                }}
              >
                Elegance in{" "}
                <br />
                <span
                  style={{
                    background: "var(--gradient-gold)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 4px 24px rgba(240, 136, 4, 0.3))",
                  }}
                >
                  Every Stitch.
                </span>
              </h1>

              <p
                style={{
                  fontSize: "clamp(1rem, 1.4vw, 1.12rem)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.75,
                  maxWidth: "520px",
                  marginBottom: "2.25rem",
                  fontWeight: 400,
                }}
              >
                Discover precision tailoring, sustainably woven silk blends, and contemporary silhouettes engineered for modern living.
              </p>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <a href="#curated-styles" className="btn btn-gold btn-lg">
                  <ShoppingBag size={18} />
                  Explore Collection
                </a>
                <Link href="/admin" className="btn btn-secondary btn-lg" style={{ gap: "0.5rem" }}>
                  <ShieldCheck size={18} />
                  Admin Portal
                </Link>
              </div>
            </motion.div>

            {/* Right: Editorial Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative" }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4/5",
                  borderRadius: "var(--radius-xl)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-lg), 0 0 50px rgba(33, 98, 161, 0.2)",
                  border: "1px solid var(--border-glass)",
                  background: "var(--surface-2)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1000"
                  alt="Haute Couture Silk Evening Gown"
                  className="editorial-img animate-kenburns"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                <div
                  className="card-glass"
                  style={{
                    position: "absolute",
                    bottom: "1.75rem",
                    left: "1.75rem",
                    right: "1.75rem",
                    padding: "1rem 1.35rem",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#FFFFFF" }}>
                      Silk Drape Evening Gown
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--highlight)", fontWeight: 700 }}>
                      ₹4,299 · Best Seller
                    </div>
                  </div>
                  <a
                    href="#curated-styles"
                    className="btn btn-sm btn-gold"
                    style={{ padding: "0.35rem 0.85rem", fontSize: "0.75rem" }}
                  >
                    View Piece
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP ──────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border-light)",
          borderBottom: "1px solid var(--border-light)",
          background: "var(--surface)",
          padding: "2rem 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            {[
              {
                icon: Truck,
                title: "Free Metro Express Shipping",
                desc: "Complimentary priority dispatch on orders over ₹999",
                color: "var(--accent)",
                bg: "var(--accent-subtle)",
              },
              {
                icon: RefreshCw,
                title: "30-Day Easy Returns",
                desc: "Effortless pickup with full zero-fee refunds",
                color: "var(--amber)",
                bg: "rgba(240, 136, 4, 0.15)",
              },
              {
                icon: ShieldCheck,
                title: "100% Certified Authentic",
                desc: "Ethically sourced GOTS-grade organic fabrics",
                color: "var(--success)",
                bg: "var(--success-bg)",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.15rem",
                    padding: "0.5rem 1rem",
                    borderRight: i < 2 ? "1px solid var(--border-light)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "var(--radius-md)",
                      background: item.bg,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. DEPARTMENT / CATEGORY SHOWCASE ───────────────────────────── */}
      <section style={{ padding: "5rem 0 3rem", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Explore Departments
            </div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, margin: "0.4rem 0" }}>
              Shop by <span className="font-serif italic font-normal">Category</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Handcrafted collections tailored for every aesthetic and occasion
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              {
                title: "Women's Collection",
                tag: "Evening Gowns & Sarees",
                count: "120+ Styles",
                img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600",
                slug: "women",
              },
              {
                title: "Men's Tailoring",
                tag: "Oxford Shirts & Blazers",
                count: "85+ Styles",
                img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600",
                slug: "men",
              },
              {
                title: "Kids Essentials",
                tag: "Organic Cotton Wear",
                count: "40+ Styles",
                img: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600",
                slug: "kids",
              },
              {
                title: "Luxury Beauty",
                tag: "Peptides & Elixirs",
                count: "30+ Formulations",
                img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
                slug: "beauty",
              },
            ].map((cat) => (
              <div
                key={cat.title}
                onClick={() => {
                  setActiveCategory(cat.slug);
                  document.getElementById("curated-styles")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="card card-hover"
                style={{
                  position: "relative",
                  aspectRatio: "3/4",
                  overflow: "hidden",
                  cursor: "pointer",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="editorial-img"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(10,13,16,0.9) 0%, rgba(10,13,16,0.2) 60%, transparent 100%)",
                  }}
                />
                <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem" }}>
                  <span className="badge badge-sale" style={{ marginBottom: "0.5rem" }}>{cat.count}</span>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>{cat.title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{cat.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CURATED STYLES CATALOG GRID ──────────────────────────────── */}
      <section
        id="curated-styles"
        style={{
          paddingTop: "4rem",
          paddingBottom: "5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1.5rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "var(--accent)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}
              >
                Seasonal Lookbook
              </div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                Curated <span className="font-serif italic font-normal text-[1.1em]">Styles</span>
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
                Showing live inventory with real-time stock allocation
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.4rem", background: "var(--surface)", padding: "4px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)" }}>
                {["all", "men", "women", "kids", "beauty"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      background: activeCategory === c ? "var(--accent)" : "transparent",
                      color: activeCategory === c ? "#FFFFFF" : "var(--text-secondary)",
                      transition: "all 0.2s",
                      textTransform: "capitalize",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div style={{ position: "relative", width: "220px" }}>
                <input
                  type="text"
                  placeholder="Search styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: "2.25rem", height: "38px", fontSize: "0.82rem" }}
                />
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-faint)",
                  }}
                />
              </div>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{ width: "150px", height: "38px", fontSize: "0.82rem", fontWeight: 600 }}
              >
                <option value="featured">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.75rem" }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: "3/4", borderRadius: "var(--radius-lg)" }} className="skeleton" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card empty-state" style={{ padding: "4rem 1rem", textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>No styles matching your selection</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="btn btn-primary btn-sm"
                style={{ marginTop: "1rem" }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.75rem" }}>
              <AnimatePresence>
                {filteredProducts.map((product, idx) => {
                  const discount = calculateDiscount(product.price, product.mrp);
                  const isWish = isInWishlist(product.id);
                  const isLowStock = product.stockQty <= 5 && product.stockQty > 0;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      <div className="card card-hover" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ position: "relative", aspectRatio: "3/4", background: "var(--surface-2)", overflow: "hidden" }}>
                          <Link href={`/product/${product.id}`} style={{ display: "block", width: "100%", height: "100%" }}>
                            {product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={`${product.name} - ${product.category?.name ?? "Apparel"}`}
                                className="editorial-img"
                                loading="lazy"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            )}
                          </Link>

                          <button
                            onClick={(e) => handleToggleWishlist(product, e)}
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              width: "36px",
                              height: "36px",
                              borderRadius: "var(--radius-full)",
                              background: isWish ? "var(--error)" : "rgba(10, 13, 16, 0.65)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255,255,255,0.15)",
                              color: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              zIndex: 2,
                            }}
                            title={isWish ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart size={16} fill={isWish ? "#FFFFFF" : "none"} />
                          </button>

                          {discount >= 10 && (
                            <span className="badge badge-sale" style={{ position: "absolute", bottom: "12px", left: "12px", zIndex: 2 }}>
                              {discount}% OFF
                            </span>
                          )}

                          {isLowStock && (
                            <span className="badge badge-low" style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
                              Only {product.stockQty} left
                            </span>
                          )}
                        </div>

                        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                          <div style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>
                            {product.category?.name ?? "Collection"}
                          </div>

                          <Link
                            href={`/product/${product.id}`}
                            style={{
                              fontWeight: 700,
                              fontSize: "1rem",
                              color: "var(--text-primary)",
                              textDecoration: "none",
                              marginBottom: "0.5rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {product.name}
                          </Link>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "0.85rem", borderTop: "1px solid var(--border-light)" }}>
                            <div>
                              <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--text-primary)" }}>
                                {formatCurrency(product.price)}
                              </span>
                              {product.mrp > product.price && (
                                <span style={{ fontSize: "0.8rem", color: "var(--text-faint)", textDecoration: "line-through", marginLeft: "0.35rem" }}>
                                  {formatCurrency(product.mrp)}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              className="btn btn-primary btn-sm"
                              style={{ gap: "0.35rem", padding: "0.45rem 0.9rem" }}
                            >
                              <ShoppingBag size={14} /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. FLASH SALE BANNER WITH LIVE COUNTDOWN TIMER ──────────────── */}
      <section style={{ padding: "2rem 0 5rem", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div
            className="card"
            style={{
              padding: "clamp(2rem, 5vw, 3.5rem)",
              background: "radial-gradient(ellipse at 80% 50%, rgba(240,136,4,0.18) 0%, rgba(33,98,161,0.25) 50%, var(--surface) 100%)",
              border: "1px solid rgba(240,136,4,0.4)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2.5rem",
              alignItems: "center",
              boxShadow: "var(--shadow-lg), 0 0 50px rgba(240,136,4,0.15)",
            }}
          >
            <div>
              <span className="badge badge-sale" style={{ marginBottom: "1rem" }}>
                <Clock size={12} /> LIMITED TIME FLASH EVENT
              </span>
              <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1rem" }}>
                Monsoon Couture Flash Sale <br />
                <span style={{ color: "var(--highlight)" }}>Up to 60% Off</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Claim an extra 15% discount across all bespoke silk shirts, blazers, and evening gowns with code <strong>VOGUE50</strong>.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={() => copyPromoCode("VOGUE50")} className="btn btn-gold btn-lg">
                  <Copy size={16} /> Copy Coupon: VOGUE50
                </button>
                <a href="#curated-styles" className="btn btn-secondary btn-lg">
                  Shop Deals →
                </a>
              </div>
            </div>

            {/* Countdown Clock Display */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "HOURS", val: timeLeft.hours },
                { label: "MINUTES", val: timeLeft.minutes },
                { label: "SECONDS", val: timeLeft.seconds },
              ].map((t) => (
                <div
                  key={t.label}
                  style={{
                    background: "rgba(10,13,16,0.85)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.25rem 1.5rem",
                    minWidth: "90px",
                    textAlign: "center",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  <div style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--highlight)" }}>
                    {String(t.val).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. BRAND STORY & ARTISANAL CRAFTSMANSHIP ────────────────────── */}
      <section style={{ padding: "4rem 0 5rem", background: "var(--surface)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              The Trend Vogue Standard
            </span>
            <h2 style={{ fontSize: "2.35rem", fontWeight: 800, margin: "0.5rem 0" }}>
              Sustainable Luxury Without <span className="font-serif italic font-normal">Compromise</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
              Every stitch embodies a commitment to heritage textile crafts, non-toxic organic botanical dyes, and equitable artisan livelihoods.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {[
              {
                icon: Scissors,
                title: "Bespoke Master Tailoring",
                desc: "Hand-finished buttonholes, reinforced double-needle seams, and natural drape silhouettes that retain shape for decades.",
              },
              {
                icon: Feather,
                title: "Mulberry Silk & GOTS Cotton",
                desc: "Ethically farmed long-staple organic cotton and grade-6A mulberry silk that breathe naturally with your skin.",
              },
              {
                icon: Globe2,
                title: "Carbon-Neutral Indian Logistics",
                desc: "100% plastic-free recycled kraft packaging and smart multi-hub routing for minimized transit emissions.",
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="card" style={{ padding: "2rem", border: "1px solid var(--border-light)" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "var(--radius-md)", background: "var(--accent-subtle)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{pillar.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.7 }}>{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. VERIFIED CUSTOMER TESTIMONIALS ───────────────────────────── */}
      <section style={{ padding: "5rem 0", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Social Proof & Trust
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, margin: "0.4rem 0" }}>
              Words from our <span className="font-serif italic font-normal">Patrons</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Over 25,000+ luxury buyers trust Trend Vogue for their signature wardrobe pieces
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.75rem" }}>
            {[
              {
                name: "Ananya Deshmukh",
                location: "South Mumbai",
                piece: "Silk Drape Evening Gown",
                rating: 5,
                text: "The silk quality is indistinguishable from European couture houses costing four times as much. The BlueDart priority express delivery arrived at my doorstep in under 24 hours.",
              },
              {
                name: "Vikramaditya Roy",
                location: "Indiranagar, Bengaluru",
                piece: "Tailored Linen Blazer",
                rating: 5,
                text: "Precision fitting right out of the box. Breathable, structured shoulders, and zero synthetic polyester lining. Truly the new benchmark for modern Indian menswear.",
              },
              {
                name: "Dr. Radhika Sen",
                location: "Vasant Vihar, New Delhi",
                piece: "Radiance Peptide Serum & Knitwear",
                rating: 5,
                text: "From the plastic-free luxury packaging to the deterministic tracking tracker, the attention to detail is world-class. Trend Vogue is my first stop for seasonal styling.",
              },
            ].map((t) => (
              <div key={t.name} className="card card-hover" style={{ padding: "1.75rem", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "0.25rem", color: "var(--highlight)", marginBottom: "1rem" }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="var(--highlight)" />
                  ))}
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, flex: 1, marginBottom: "1.5rem" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem" }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.88rem" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.location} · <em>Verified Buyer</em></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. INTERACTIVE FAQ ACCORDION ────────────────────────────────── */}
      <section style={{ padding: "4rem 0 5rem", background: "var(--surface)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container" style={{ maxWidth: "880px" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Got Questions?
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, margin: "0.4rem 0" }}>
              Frequently Asked <span className="font-serif italic font-normal">Questions</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Everything you need to know about our products, delivery matrices, and return policies
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="card"
                  style={{
                    border: isOpen ? "1px solid var(--accent)" : "1px solid var(--border)",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: "100%",
                      padding: "1.25rem 1.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                        color: isOpen ? "var(--accent)" : "var(--text-muted)",
                        flexShrink: 0,
                        marginLeft: "1rem",
                      }}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div
                          style={{
                            padding: "0 1.5rem 1.25rem",
                            fontSize: "0.88rem",
                            lineHeight: 1.75,
                            color: "var(--text-secondary)",
                            borderTop: "1px solid var(--border-light)",
                            paddingTop: "1rem",
                          }}
                        >
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. VIP NEWSLETTER SUBSCRIPTION BOX ──────────────────────────── */}
      <section style={{ padding: "5rem 0", position: "relative", zIndex: 1 }}>
        <div className="container" style={{ maxWidth: "780px" }}>
          <div
            className="card"
            style={{
              padding: "clamp(2rem, 5vw, 3.5rem)",
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(33,98,161,0.2) 0%, rgba(240,136,4,0.15) 100%)",
              border: "1px solid rgba(33,98,161,0.35)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ width: "56px", height: "56px", borderRadius: "999px", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <Send size={24} />
            </div>
            <h2 style={{ fontSize: "2.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Join the Trend Vogue VIP Circle
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: "1.75rem", maxWidth: "520px", margin: "0 auto 1.75rem" }}>
              Subscribe to receive private preview access to our seasonal runways, bespoke lookbooks, and an instant 20% discount on your first order.
            </p>

            {newsletterSubscribed ? (
              <div style={{ background: "var(--success-bg)", color: "var(--success)", padding: "1rem", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: "0.95rem" }}>
                🎉 You're on the list! Use code <strong style={{ color: "#fff", textDecoration: "underline" }}>WELCOME20</strong> at checkout for 20% off.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} style={{ display: "flex", gap: "0.75rem", maxWidth: "480px", margin: "0 auto", flexWrap: "wrap" }}>
                <input
                  type="email"
                  placeholder="Enter your personal email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  style={{ flex: 1, minWidth: "220px", height: "46px" }}
                />
                <button type="submit" className="btn btn-gold btn-lg" style={{ height: "46px", padding: "0 1.5rem" }}>
                  Unlock 20% Off →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── 10. DETERMINISTIC DELIVERY PIPELINE DEMO WIDGET ─────────────── */}
      <section style={{ paddingBottom: "5rem", position: "relative", zIndex: 1 }}>
        <div className="container">
          <div
            className="card"
            style={{
              padding: "clamp(1.5rem, 4vw, 2.5rem)",
              border: "1px solid rgba(33, 98, 161, 0.4)",
              background: "linear-gradient(145deg, rgba(17, 22, 29, 0.98), rgba(24, 32, 42, 0.95))",
              boxShadow: "var(--shadow-lg), 0 0 40px rgba(33, 98, 161, 0.2)",
            }}
          >
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span className="badge badge-metro">LIVE DISPATCH PIPELINE</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>Order #TV-948201</span>
                </div>
                <h3 style={{ fontSize: "1.45rem", fontWeight: 800 }}>Deterministic Delivery Tracking</h3>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Simulate Status:
                </span>
                <select
                  value={trackerStatus}
                  onChange={(e) => {
                    setTrackerStatus(e.target.value);
                    toast.success(`Fulfillment pipeline updated to: ${e.target.value}`);
                  }}
                  style={{ width: "180px", height: "38px", fontWeight: 700, fontSize: "0.82rem" }}
                >
                  <option value="ORDERED">1. Order Placed</option>
                  <option value="PACKED">2. Packed in Hub</option>
                  <option value="SHIPPED">3. Shipped / In Transit</option>
                  <option value="OUT_FOR_DELIVERY">4. Out for Delivery</option>
                  <option value="DELIVERED">5. Delivered 🎉</option>
                </select>
              </div>
            </div>

            <div style={{ position: "relative", margin: "2.5rem 0" }}>
              <div
                style={{
                  position: "absolute",
                  top: "22px",
                  left: "30px",
                  right: "30px",
                  height: "3px",
                  background: "var(--surface-3)",
                  zIndex: 0,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    background: "var(--gradient-accent)",
                    transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {[
                  { step: "ORDERED", label: "Ordered", icon: Box },
                  { step: "PACKED", label: "Packed", icon: Box },
                  { step: "SHIPPED", label: "Shipped", icon: Truck },
                  { step: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: MapPin },
                  { step: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;

                  return (
                    <div
                      key={item.step}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.6rem",
                        width: "85px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "var(--radius-full)",
                          background: isCompleted
                            ? "var(--accent)"
                            : isActive
                            ? "var(--amber)"
                            : "var(--surface-2)",
                          border: `2px solid ${
                            isCompleted ? "var(--accent)" : isActive ? "var(--amber)" : "var(--border)"
                          }`,
                          color: isCompleted ? "#FFFFFF" : isActive ? "#0A0D10" : "var(--text-faint)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.4s ease",
                          transform: isActive ? "scale(1.15)" : "scale(1)",
                          boxShadow: isActive ? "0 0 20px rgba(240, 136, 4, 0.45)" : "none",
                        }}
                      >
                        <Icon size={18} />
                      </div>

                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: isActive || isCompleted ? 700 : 500,
                          color: isActive
                            ? "var(--amber)"
                            : isCompleted
                            ? "var(--text-primary)"
                            : "var(--text-faint)",
                          textAlign: "center",
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                background: "var(--surface-2)",
                padding: "1.15rem 1.5rem",
                borderRadius: "var(--radius-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.85rem",
                flexWrap: "wrap",
                gap: "0.75rem",
                border: "1px solid var(--border-light)",
              }}
            >
              <div>
                📍 Destination: <strong>Mumbai Metro Hub (PIN 400001)</strong>
              </div>
              <div>
                ⚡ Carrier: <strong>BlueDart Priority Air Express</strong>
              </div>
              <div>
                Estimated Delivery:{" "}
                <strong style={{ color: "var(--highlight)" }}>
                  {trackerStatus === "DELIVERED"
                    ? "Delivered to Customer"
                    : trackerStatus === "OUT_FOR_DELIVERY"
                    ? "Arriving Today by 4 PM"
                    : "Tomorrow by 8 PM"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. LUXURY FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "4rem 0 2rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem", marginBottom: "3rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.35rem", marginBottom: "1rem" }}>
                TREND<span style={{ color: "var(--amber)" }}>VOGUE</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                Haute couture tailoring, certified organic cottons, and timeless modern silhouettes for contemporary luxury living.
              </p>
              <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                Crafted in India · Shipping Pan-India
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem", color: "var(--accent)" }}>
                Departments
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
                <li><Link href="/shop/women" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Women's Haute Couture</Link></li>
                <li><Link href="/shop/men" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Men's Tailoring & Denim</Link></li>
                <li><Link href="/shop/kids" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Kids Organic Essentials</Link></li>
                <li><Link href="/shop/beauty" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Luxury Skincare & Elixirs</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem", color: "var(--accent)" }}>
                Customer Care
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
                <li><Link href="/orders" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Track My Order</Link></li>
                <li><Link href="/profile" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Shipping & Delivery Matrix</Link></li>
                <li><Link href="/profile" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>30-Day Easy Returns</Link></li>
                <li><Link href="/profile" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Interactive Size Guide</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem", color: "var(--accent)" }}>
                Admin & Governance
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
                <li><Link href="/admin" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Admin Back-Office CMS</Link></li>
                <li><Link href="/login" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Customer Account Portal</Link></li>
                <li><Link href="/register" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Create Free Account</Link></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.8rem", color: "var(--text-faint)" }}>
            <div>© 2026 Trend Vogue Luxury Brands Pvt Ltd. All rights reserved.</div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <span>🔒 256-Bit SSL Encrypted Checkout</span>
              <span>•</span>
              <span>⚡ Powered by PostgreSQL & Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
