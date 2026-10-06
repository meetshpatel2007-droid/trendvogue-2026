"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Users, ShoppingBag, Tag, Settings,
  LogOut, BarChart3, Star, ExternalLink, Sun, Moon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/admin",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/products", label: "Products",   icon: Package },
  { href: "/admin/orders",   label: "Orders",     icon: ShoppingBag },
  { href: "/admin/users",    label: "Users",      icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/reviews",  label: "Reviews",    icon: Star },
  { href: "/admin/reports",  label: "Reports",    icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname           = usePathname();
  const { user, logout }   = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const router             = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside style={{
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      width: "240px",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "1.1rem",
          letterSpacing: "-0.02em",
        }}>
          TREND
          <span style={{
            background: "var(--gradient-gold)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}> VOGUE</span>
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginTop: "0.2rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Admin Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem" }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.625rem 0.875rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: active ? 700 : 500,
                color: active ? "var(--accent)" : "var(--text-secondary)",
                background: active ? "var(--accent-subtle)" : "transparent",
                textDecoration: "none",
                marginBottom: "0.125rem",
                transition: "all 0.15s",
              }}
            >
              <Icon size={17} />
              {label}
              {active && (
                <div style={{
                  marginLeft: "auto",
                  width: "5px",
                  height: "5px",
                  borderRadius: "999px",
                  background: "var(--accent)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "0.75rem 0.5rem", borderTop: "1px solid var(--border)" }}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.875rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "0.25rem",
          }}
        >
          <ExternalLink size={14} /> View Store
        </a>

        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            width: "100%",
            padding: "0.5rem 0.875rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            marginBottom: "0.25rem",
          }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        {/* User info */}
        {user && (
          <div style={{
            padding: "0.75rem 0.875rem",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-md)",
            marginTop: "0.5rem",
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.25rem" }}>{user.name}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginBottom: "0.625rem" }}>{user.email}</div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.75rem",
                color: "var(--error)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                padding: 0,
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
