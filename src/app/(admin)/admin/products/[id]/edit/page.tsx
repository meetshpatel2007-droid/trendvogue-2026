"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d.data?.product ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ height: "400px", borderRadius: "var(--radius-lg)" }} className="skeleton" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state" style={{ padding: "3rem" }}>
        <p>Product not found</p>
        <Link href="/admin/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: "0.85rem",
            marginBottom: "0.75rem",
          }}
        >
          <ArrowLeft size={15} /> Back to Products
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Edit Product
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Updating #{product.id.slice(-6).toUpperCase()} — {product.name}
        </p>
      </div>

      <ProductForm initialData={product} isEdit />
    </div>
  );
}
