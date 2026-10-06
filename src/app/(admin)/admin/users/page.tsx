"use client";

import { useEffect, useState, Suspense } from "react";
import { Search, UserCheck, UserX, Shield, Users, Mail, Phone, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  _count: { orders: number };
}

function UsersListContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setUsers(json.data.users);
        setTotalPages(json.data.pagination.pages);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean, userName: string) => {
    setTogglingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isBlocked: !currentStatus }),
      });
      if (res.ok) {
        toast.success(`${userName} is now ${!currentStatus ? "Blocked" : "Active"}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBlocked: !currentStatus } : u))
        );
      } else {
        const json = await res.json();
        toast.error(json.error ?? "Operation failed");
      }
    } catch {
      toast.error("Error updating user status");
    } finally {
      setTogglingId(null);
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
          Customer Directory
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Inspect registered user profiles, order volume, and access control
        </p>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
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
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.5rem", height: "40px" }}
          />
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: "0.5rem", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: "55px", borderRadius: "var(--radius-md)" }} className="skeleton" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: "3.5rem 1rem" }}>
            <Users size={42} color="var(--text-faint)" />
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No users found</p>
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
                <th style={{ padding: "0.75rem 1rem" }}>Customer</th>
                <th style={{ padding: "0.75rem 1rem" }}>Phone</th>
                <th style={{ padding: "0.75rem 1rem" }}>Orders Placed</th>
                <th style={{ padding: "0.75rem 1rem" }}>Joined</th>
                <th style={{ padding: "0.75rem 1rem" }}>Account Status</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Access Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "999px",
                          background: "var(--accent-subtle)",
                          color: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          flexShrink: 0,
                        }}
                      >
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{u.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)" }}>
                    {u.phone || "—"}
                  </td>

                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                    {u._count?.orders ?? 0} order(s)
                  </td>

                  <td style={{ padding: "0.75rem 1rem", color: "var(--text-faint)", fontSize: "0.75rem" }}>
                    {formatDate(u.createdAt)}
                  </td>

                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      className="badge"
                      style={{
                        background: u.isBlocked ? "var(--error-bg)" : "var(--success-bg)",
                        color: u.isBlocked ? "var(--error)" : "var(--success)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {u.isBlocked ? "Suspended" : "Active"}
                    </span>
                  </td>

                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    <button
                      onClick={() => handleToggleBlock(u.id, u.isBlocked, u.name)}
                      disabled={togglingId === u.id}
                      className={`btn btn-sm ${u.isBlocked ? "btn-secondary" : "btn-danger"}`}
                      style={{ gap: "0.35rem", padding: "0.35rem 0.75rem" }}
                    >
                      {u.isBlocked ? (
                        <>
                          <UserCheck size={14} /> Unblock
                        </>
                      ) : (
                        <>
                          <UserX size={14} /> Block
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
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

export default function AdminUsersPage() {
  return (
    <Suspense>
      <UsersListContent />
    </Suspense>
  );
}
