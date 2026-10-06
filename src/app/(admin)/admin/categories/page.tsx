"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, Trash2, Edit, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { credentials: "include" });
      const json = await res.json();
      if (res.ok && json.data) {
        setCategories(json.data.categories);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setCreating(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, slug }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Category "${name}" created`);
        setName("");
        setSlug("");
        fetchCategories();
      } else {
        toast.error(json.error ?? "Failed to create category");
      }
    } catch {
      toast.error("Error creating category");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error(json.error ?? "Failed to delete");
      }
    } catch {
      toast.error("Error deleting category");
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
          Department & Categories
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Organize storefront navigation, taxonomies, and catalog groupings
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.75rem", alignItems: "start" }}>
        {/* Add Category Card */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
            Add Category
          </h2>

          <form onSubmit={handleCreate}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Footwear"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">URL Slug *</label>
              <input
                type="text"
                placeholder="e.g. footwear"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Plus size={16} />
              {creating ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="card" style={{ padding: "0.5rem", overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: "45px", borderRadius: "var(--radius-md)" }} className="skeleton" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state" style={{ padding: "3rem 1rem" }}>
              <Tag size={36} color="var(--text-faint)" />
              <p style={{ fontWeight: 600, fontSize: "1rem" }}>No categories created</p>
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
                  <th style={{ padding: "0.75rem 1rem" }}>Category</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Slug</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Products</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid var(--border-light)",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {c.name}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--accent)" }}>
                      <code>/{c.slug}</code>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          background: "var(--surface-2)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {c._count?.products ?? 0} item(s)
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "0.4rem", color: "var(--error)" }}
                        title="Delete Category"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
