import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
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
          Add New Product
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Publish a new garment or accessory to the Trend Vogue storefront
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
