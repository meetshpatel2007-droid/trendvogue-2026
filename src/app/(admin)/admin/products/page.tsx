"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  ExternalLink,
  Package,
  CheckCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  images: string[];
  stockQty: number;
  isActive: boolean;
  category?: { name: string; slug: string };
  createdAt: string;
}

function ProductsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(search ? { search } : {}),
        ...(category ? { category } : {}),
      });
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setProducts(json.data.products);
        setTotalPages(json.data.pagination.pages);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data?.categories ?? []));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Product removed from storefront");
        fetchProducts();
      } else {
        const json = await res.json();
        toast.error(json.error ?? "Failed to delete");
      }
    } catch {
      toast.error("Error deleting product");
    }
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
            Products Catalog
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Manage your store's inventory, stock, and pricing
          </p>
        </div>

        <Link href="/admin/products/new" className="btn btn-primary" style={{ gap: "0.5rem" }}>
          <Plus size={16} />
          Add New Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: "220px", position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-faint)",
            }}
          />
          <input
            type="search"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.5rem", height: "40px" }}
          />
        </form>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          style={{ height: "40px", minWidth: "160px" }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: "0.5rem", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: "55px", borderRadius: "var(--radius-md)" }} className="skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state" style={{ padding: "3rem 1rem" }}>
            <Package size={42} color="var(--text-faint)" />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No products found</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Try altering your search or filters</p>
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
                <th style={{ padding: "0.75rem 1rem" }}>Product</th>
                <th style={{ padding: "0.75rem 1rem" }}>Category</th>
                <th style={{ padding: "0.75rem 1rem" }}>Price / MRP</th>
                <th style={{ padding: "0.75rem 1rem" }}>Inventory</th>
                <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLowStock = p.stockQty <= 5 && p.stockQty > 0;
                const isOutOfStock = p.stockQty === 0;

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid var(--border-light)",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "55px",
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            position: "relative",
                            background: "var(--surface-2)",
                            flexShrink: 0,
                          }}
                        >
                          {p.images[0] && (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              sizes="44px"
                              style={{ objectFit: "cover" }}
                            />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "240px",
                            }}
                          >
                            {p.name}
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                            ID: {p.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          background: "var(--surface-2)",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {p.category?.name ?? "General"}
                      </span>
                    </td>

                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</div>
                      {p.mrp > p.price && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-faint)", textDecoration: "line-through" }}>
                          {formatCurrency(p.mrp)}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: isOutOfStock
                            ? "var(--error)"
                            : isLowStock
                            ? "var(--amber)"
                            : "var(--text-primary)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        {isOutOfStock ? (
                          <>
                            <AlertCircle size={14} /> Out of Stock
                          </>
                        ) : isLowStock ? (
                          <>
                            <AlertCircle size={14} /> Low: {p.stockQty} left
                          </>
                        ) : (
                          `${p.stockQty} in stock`
                        )}
                      </span>
                    </td>

                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        className="badge"
                        style={{
                          background: p.isActive ? "var(--success-bg)" : "var(--error-bg)",
                          color: p.isActive ? "var(--success)" : "var(--error)",
                          fontSize: "0.75rem",
                        }}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <Link
                          href={`/product/${p.id}`}
                          target="_blank"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "0.4rem" }}
                          title="View on Store"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.4rem" }}
                          title="Edit Product"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "0.4rem", color: "var(--error)" }}
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

export default function AdminProductsPage() {
  return (
    <Suspense>
      <ProductsListContent />
    </Suspense>
  );
}
