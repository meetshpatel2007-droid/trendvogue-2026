"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; email: string };
  product: { id: string; name: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Fetch all products or reviews
      const res = await fetch("/api/products?limit=50");
      const json = await res.json();
      if (res.ok && json.data?.products) {
        // Collect reviews from products
        const allReviews: Review[] = [];
        for (const p of json.data.products) {
          if (p.reviews && p.reviews.length > 0) {
            for (const r of p.reviews) {
              allReviews.push({
                ...r,
                product: { id: p.id, name: p.name },
                user: r.user ?? { name: "Customer", email: "" },
              });
            }
          }
        }
        setReviews(allReviews);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Review deleted");
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error("Failed to delete review");
      }
    } catch {
      toast.error("Error deleting review");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Customer Reviews
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Moderate feedback, comments, and star ratings across all product lines
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: "80px", borderRadius: "var(--radius-lg)" }} className="skeleton" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card empty-state" style={{ padding: "4rem 1rem" }}>
          <MessageSquare size={44} color="var(--text-faint)" />
          <p style={{ fontWeight: 600, fontSize: "1rem" }}>No reviews submitted yet</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Verified customer reviews will appear here for moderation
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ padding: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < r.rating ? "var(--highlight)" : "transparent"}
                          color={i < r.rating ? "var(--highlight)" : "var(--border)"}
                        />
                      ))}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{r.user.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                      on {formatDate(r.createdAt)}
                    </span>
                  </div>

                  <Link
                    href={`/product/${r.product.id}`}
                    target="_blank"
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--accent)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    Product: {r.product.name} <ExternalLink size={12} />
                  </Link>
                </div>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--error)", padding: "0.4rem" }}
                  title="Remove review"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
