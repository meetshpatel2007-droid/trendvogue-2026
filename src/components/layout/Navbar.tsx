"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  ShoppingBag,
  Heart,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  LogOut,
  Settings,
  Package,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const CATEGORIES = [
  { label: "Men",    href: "/shop/men" },
  { label: "Women",  href: "/shop/women" },
  { label: "Kids",   href: "/shop/kids" },
  { label: "Beauty", href: "/shop/beauty" },
];

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const cartCount     = useCartStore((s) => s.getItemCount());
  const openCart      = useCartStore((s) => s.openDrawer);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, logout } = useAuthStore();

  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ,    setSearchQ]    = useState("");

  const navRef      = useRef<HTMLElement>(null);
  const mobileRef   = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animate mobile menu
  useEffect(() => {
    if (!mobileRef.current) return;
    if (mobileOpen) {
      gsap.fromTo(
        mobileRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.35, ease: "power3.out" }
      );
    } else {
      gsap.to(mobileRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.25,
        ease: "power3.in",
      });
    }
  }, [mobileOpen]);

  // Focus search input
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setUserOpen(false);
    window.location.assign("/"); // full load drops cached logged-in pages
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          background: scrolled ? "var(--nav-bg)" : "transparent",
          backdropFilter: scrolled ? "var(--nav-blur)" : "none",
          WebkitBackdropFilter: scrolled ? "var(--nav-blur)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <div className="container">
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
            gap: "1rem",
          }}>
            {/* Logo */}
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.4rem",
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              TREND
              <span style={{
                background: "var(--gradient-gold)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {" "}VOGUE
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              flexGrow: 1,
              justifyContent: "center",
            }} className="desktop-nav">
              <Link
                href="/shop"
                style={{
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: isActive("/shop") ? "var(--accent)" : "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                All Products
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  style={{
                    padding: "0.5rem 0.875rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: isActive(cat.href) ? "var(--accent)" : "var(--text-secondary)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn btn-ghost btn-sm"
                style={{ padding: "0.5rem" }}
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="btn btn-ghost btn-sm"
                style={{ padding: "0.5rem", position: "relative" }}
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "2px", right: "2px",
                    background: "var(--amber)",
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    minWidth: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}>
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="btn btn-ghost btn-sm"
                style={{ padding: "0.5rem", position: "relative" }}
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "2px", right: "2px",
                    background: "var(--accent)",
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    minWidth: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="btn btn-ghost btn-sm"
                style={{ padding: "0.5rem" }}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Menu */}
              {user ? (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.375rem 0.75rem",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-full)",
                      color: "var(--text-primary)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    aria-label="User menu"
                    aria-expanded={userOpen}
                  >
                    <div style={{
                      width: "24px", height: "24px",
                      borderRadius: "999px",
                      background: "var(--gradient-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "white",
                      flexShrink: 0,
                    }}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="desktop-nav">{user.name.split(" ")[0]}</span>
                    <ChevronDown size={12} />
                  </button>

                  {userOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                        padding: "0.5rem",
                        minWidth: "180px",
                        boxShadow: "var(--shadow-lg)",
                        zIndex: 100,
                      }}
                    >
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--amber)",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          <LayoutDashboard size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setUserOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-secondary)",
                          fontSize: "0.875rem",
                          textDecoration: "none",
                        }}
                      >
                        <User size={15} /> My Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-secondary)",
                          fontSize: "0.875rem",
                          textDecoration: "none",
                        }}
                      >
                        <Package size={15} /> My Orders
                      </Link>
                      <div style={{ height: "1px", background: "var(--border)", margin: "0.375rem 0" }} />
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--error)",
                          fontSize: "0.875rem",
                          width: "100%",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn btn-ghost btn-sm mobile-menu-btn"
                style={{ padding: "0.5rem" }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search Bar (expandable) */}
          {searchOpen && (
            <div style={{
              paddingBottom: "0.75rem",
              animation: "slideDown 0.2s ease",
            }}>
              <form onSubmit={handleSearch}>
                <div style={{ position: "relative" }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-faint)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search for clothes, brands..."
                    style={{
                      paddingLeft: "2.5rem",
                      paddingRight: "1rem",
                      height: "42px",
                      borderRadius: "var(--radius-full)",
                    }}
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(320px, 100vw)",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          zIndex: 400,
          padding: "5rem 1.5rem 2rem",
          display: mobileOpen ? "flex" : "none",
          flexDirection: "column",
          gap: "0.5rem",
          overflowY: "auto",
        }}
      >
        <Link href="/shop" onClick={() => setMobileOpen(false)}
          style={{ padding: "0.75rem", fontWeight: 600, color: "var(--text-primary)", textDecoration: "none", display: "block" }}>
          All Products
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            onClick={() => setMobileOpen(false)}
            style={{
              padding: "0.75rem",
              fontWeight: 600,
              color: isActive(cat.href) ? "var(--accent)" : "var(--text-secondary)",
              textDecoration: "none",
              display: "block",
            }}
          >
            {cat.label}
          </Link>
        ))}
        <div style={{ height: "1px", background: "var(--border)", margin: "0.5rem 0" }} />
        {user ? (
          <>
            <Link href="/profile" onClick={() => setMobileOpen(false)}
              style={{ padding: "0.75rem", color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <User size={16} /> My Profile
            </Link>
            <Link href="/orders" onClick={() => setMobileOpen(false)}
              style={{ padding: "0.75rem", color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Package size={16} /> My Orders
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setMobileOpen(false)}
                style={{ padding: "0.75rem", color: "var(--amber)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                <LayoutDashboard size={16} /> Admin Dashboard
              </Link>
            )}
            <button onClick={handleLogout}
              style={{ padding: "0.75rem", color: "var(--error)", display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "1rem", width: "100%", textAlign: "left" }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--overlay)",
            zIndex: 300,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
