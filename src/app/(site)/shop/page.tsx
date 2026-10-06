"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";

interface Product {
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
}

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popularity", label: "Most Popular" },
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "2Y", "4Y", "6Y", "8Y", "10Y"];
const ALL_COLORS = ["Black", "White", "Navy", "Blue", "Grey", "Red", "Green", "Beige", "Pink", "Brown"];

function ShopContent() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const search   = searchParams.get("search")   ?? "";
  const category = searchParams.get("category") ?? "";
  const sort     = searchParams.get("sort")     ?? "newest";
  const page     = parseInt(searchParams.get("page") ?? "1");
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const sizes    = searchParams.get("sizes")    ?? "";
  const colors   = searchParams.get("colors")   ?? "";

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set(key, value); } else { params.delete(key); }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const toggleFilter = (key: string, value: string) => {
    const current = searchParams.get(key)?.split(",").filter(Boolean) ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setParam(key, updated.join(","));
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, page: page.toString(), limit: "12" });
    if (search)   params.set("search",   search);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sizes)    params.set("sizes",    sizes);
    if (colors)   params.set("colors",   colors);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.data?.products ?? []);
        setTotalPages(d.data?.pagination?.pages ?? 1);
        setTotalCount(d.data?.pagination?.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, category, sort, page, minPrice, maxPrice, sizes, colors]);

  const activeFilterCount = [
    minPrice, maxPrice, sizes, colors,
  ].filter(Boolean).length;

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontFamily: "var(--font-display)" }}>
          {category ? category.charAt(0).toUpperCase() + category.slice(1) : "All Products"}
          {search && <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.7em" }}> — "{search}"</span>}
        </h1>
        {!loading && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          {totalCount} product{totalCount !== 1 ? "s" : ""} found
        </p>}
      </div>

      {/* Controls bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input
            type="search"
            placeholder="Search products..."
            defaultValue={search}
            style={{ paddingLeft: "2.25rem", height: "40px", fontSize: "0.875rem" }}
            onChange={(e) => {
              const val = e.target.value;
              clearTimeout((window as any).__searchTimeout);
              (window as any).__searchTimeout = setTimeout(() => setParam("search", val), 400);
            }}
          />
        </div>

        {/* Sort */}
        <div style={{ position: "relative" }}>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            style={{ height: "40px", paddingRight: "2rem", fontSize: "0.875rem", minWidth: "180px", appearance: "none" }}
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-faint)" }} />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-secondary btn-sm"
          style={{ height: "40px", gap: "0.4rem", position: "relative" }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{
              position: "absolute", top: "-6px", right: "-6px",
              background: "var(--accent)", color: "white",
              width: "18px", height: "18px",
              borderRadius: "999px",
              fontSize: "0.65rem",
              fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="card"
          style={{ padding: "1.25rem", marginBottom: "1.5rem" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {/* Price range */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>
                PRICE RANGE
              </h4>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input type="number" placeholder="Min" defaultValue={minPrice}
                  style={{ height: "36px", fontSize: "0.8rem" }}
                  onChange={(e) => setParam("minPrice", e.target.value)} />
                <span style={{ color: "var(--text-faint)" }}>—</span>
                <input type="number" placeholder="Max" defaultValue={maxPrice}
                  style={{ height: "36px", fontSize: "0.8rem" }}
                  onChange={(e) => setParam("maxPrice", e.target.value)} />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>SIZES</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {ALL_SIZES.map((size) => {
                  const selected = sizes.split(",").includes(size);
                  return (
                    <button key={size} onClick={() => toggleFilter("sizes", size)}
                      style={{
                        padding: "3px 10px",
                        border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: selected ? 700 : 400,
                        background: selected ? "var(--accent-subtle)" : "transparent",
                        color: selected ? "var(--accent)" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>COLORS</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {ALL_COLORS.map((color) => {
                  const selected = colors.split(",").includes(color);
                  return (
                    <button key={color} onClick={() => toggleFilter("colors", color)}
                      style={{
                        padding: "3px 10px",
                        border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        fontWeight: selected ? 700 : 400,
                        background: selected ? "var(--accent-subtle)" : "transparent",
                        color: selected ? "var(--accent)" : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString());
                ["minPrice","maxPrice","sizes","colors"].forEach((k) => p.delete(k));
                router.push(`${pathname}?${p.toString()}`);
              }}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: "1rem", color: "var(--error)" }}
            >
              <X size={14} /> Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {/* Products grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "3/4", borderRadius: "var(--radius-lg)" }} className="skeleton" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <Search size={48} strokeWidth={1.2} />
          <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>No products found</p>
          <p style={{ fontSize: "0.875rem" }}>Try adjusting your search or filters</p>
          <button className="btn btn-primary" onClick={() => router.push(pathname)}>
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "3rem" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setParam("page", p.toString())}
                  className={p === page ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  return <Suspense><ShopContent /></Suspense>;
}
