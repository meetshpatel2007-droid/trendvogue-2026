"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "@/server/schemas/product.schema";
import { Upload, X, Loader2, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];
const DEFAULT_COLORS = ["Black", "White", "Navy", "Blue", "Grey", "Red", "Green", "Beige", "Pink", "Brown"];

export function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes ?? ["S", "M", "L", "XL"]);
  const [colors, setColors] = useState<string[]>(initialData?.colors ?? ["Black", "Navy"]);
  const [customColor, setCustomColor] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          price: initialData.price,
          mrp: initialData.mrp,
          stockQty: initialData.stockQty,
          categoryId: initialData.categoryId,
          images: initialData.images,
          sizes: initialData.sizes,
          colors: initialData.colors,
          isActive: initialData.isActive ?? true,
        }
      : {
          isActive: true,
          sizes: ["S", "M", "L", "XL"],
          colors: ["Black", "Navy"],
          images: [],
        },
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data?.categories ?? []));
  }, []);

  useEffect(() => {
    setValue("images", images);
  }, [images, setValue]);

  useEffect(() => {
    setValue("sizes", sizes);
  }, [sizes, setValue]);

  useEffect(() => {
    setValue("colors", colors);
  }, [colors, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.data?.urls) {
        setImages((prev) => [...prev, ...json.data.urls]);
        toast.success("Images uploaded successfully");
      } else {
        toast.error(json.error ?? "Failed to upload image");
      }
    } catch {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const addCustomColor = () => {
    if (customColor.trim() && !colors.includes(customColor.trim())) {
      setColors((prev) => [...prev, customColor.trim()]);
      setCustomColor("");
    }
  };

  const onSubmit = async (data: CreateProductInput) => {
    if (images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }
    if (sizes.length === 0) {
      toast.error("Please select at least one size");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/products/${initialData.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(isEdit ? "Product updated!" : "Product published successfully! 🎉");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(json.error ?? "Operation failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.75rem", alignItems: "start" }}>
        {/* Main Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Basic Info */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
              General Information
            </h2>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Product Name *</label>
              <input
                {...register("name")}
                placeholder="e.g. Slim-Fit Cotton Oxford Shirt"
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                {...register("description")}
                rows={5}
                placeholder="Describe the fabric, tailoring, style tips, fit..."
                style={{ resize: "vertical" }}
              />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>
          </div>

          {/* Media */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Product Imagery
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Upload high-resolution editorial fashion photos (min 1 image).
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.875rem", marginBottom: "1rem" }}>
              {images.map((url, idx) => (
                <div
                  key={url}
                  style={{
                    position: "relative",
                    aspectRatio: "3/4",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: idx === 0 ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <Image src={url} alt={`Preview ${idx}`} fill sizes="110px" style={{ objectFit: "cover" }} />
                  {idx === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(33,98,161,0.9)",
                        color: "white",
                        fontSize: "0.65rem",
                        textAlign: "center",
                        fontWeight: 700,
                        padding: "2px 0",
                      }}
                    >
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      border: "none",
                      borderRadius: "999px",
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Upload Drop Button */}
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  aspectRatio: "3/4",
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius-md)",
                  cursor: uploading ? "not-allowed" : "pointer",
                  background: "var(--surface-2)",
                  transition: "all 0.2s",
                }}
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin" color="var(--accent)" />
                ) : (
                  <>
                    <Upload size={22} color="var(--text-muted)" style={{ marginBottom: "0.35rem" }} />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Add Photo
                    </span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {/* Variants: Sizes & Colors */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
              Variants & Attributes
            </h2>

            {/* Sizes */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ marginBottom: "0.5rem" }}>
                Available Sizes *
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {DEFAULT_SIZES.map((s) => {
                  const active = sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      style={{
                        padding: "0.4rem 0.85rem",
                        borderRadius: "var(--radius-sm)",
                        border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "var(--accent-subtle)" : "transparent",
                        color: active ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: active ? 700 : 500,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="form-label" style={{ marginBottom: "0.5rem" }}>
                Available Colors
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                {DEFAULT_COLORS.map((c) => {
                  const active = colors.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleColor(c)}
                      style={{
                        padding: "0.4rem 0.85rem",
                        borderRadius: "var(--radius-sm)",
                        border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "var(--accent-subtle)" : "transparent",
                        color: active ? "var(--accent)" : "var(--text-secondary)",
                        fontWeight: active ? 700 : 500,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>

              {/* Add custom color */}
              <div style={{ display: "flex", gap: "0.5rem", maxWidth: "260px" }}>
                <input
                  type="text"
                  placeholder="Custom color..."
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{ height: "36px", fontSize: "0.8rem" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomColor();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomColor}
                  className="btn btn-secondary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Pricing, Category, Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Status & Actions */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem" }}>
              Publishing
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                style={{ width: "18px", height: "18px", accentColor: "var(--accent)" }}
              />
              <label htmlFor="isActive" style={{ fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                Product Active on Storefront
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : isEdit ? (
                "Update Product"
              ) : (
                "Publish Product"
              )}
            </button>
          </div>

          {/* Pricing & Stock */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem" }}>
              Pricing & Stock
            </h3>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Selling Price (₹) *</label>
              <input
                type="number"
                step="1"
                placeholder="1499"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <span className="form-error">{errors.price.message}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Original MRP (₹) *</label>
              <input
                type="number"
                step="1"
                placeholder="2999"
                {...register("mrp", { valueAsNumber: true })}
              />
              {errors.mrp && <span className="form-error">{errors.mrp.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                step="1"
                placeholder="50"
                {...register("stockQty", { valueAsNumber: true })}
              />
              {errors.stockQty && <span className="form-error">{errors.stockQty.message}</span>}
            </div>
          </div>

          {/* Category */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "1rem" }}>
              Category
            </h3>

            <div className="form-group">
              <label className="form-label">Select Department *</label>
              <select {...register("categoryId")}>
                <option value="">Choose category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="form-error">{errors.categoryId.message}</span>}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
