"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LINKS = {
  Company:  [
    { label: "About Us",    href: "#" },
    { label: "Careers",     href: "#" },
    { label: "Press",       href: "#" },
    { label: "Sitemap",     href: "#" },
  ],
  Customer: [
    { label: "My Account",  href: "/profile" },
    { label: "My Orders",   href: "/orders" },
    { label: "Track Order", href: "/orders" },
    { label: "Returns",     href: "#" },
  ],
  Shop: [
    { label: "Men",    href: "/shop/men" },
    { label: "Women",  href: "/shop/women" },
    { label: "Kids",   href: "/shop/kids" },
    { label: "Beauty", href: "/shop/beauty" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing! 🎉");
    setEmail("");
  };

  return (
    <footer style={{
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
      paddingTop: "4rem",
      paddingBottom: "2rem",
      marginTop: "5rem",
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "2.5rem",
          marginBottom: "3rem",
        }}>
          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.5rem",
              letterSpacing: "-0.03em",
              marginBottom: "0.75rem",
            }}>
              TREND
              <span style={{
                background: "var(--gradient-gold)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}> VOGUE</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1rem" }}>
              Premium clothing for every occasion. Discover the latest trends in Men, Women, Kids & Beauty.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Twitter,   href: "#" },
                { Icon: Facebook,  href: "#" },
                { Icon: Youtube,   href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  style={{
                    width: "36px", height: "36px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--accent)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "white";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                  }}
                  aria-label={Icon.name}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}>
                {title}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent)")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--text-primary)",
              marginBottom: "1rem",
            }}>
              Newsletter
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
              Get exclusive deals and the latest trends straight to your inbox.
            </p>
            <form onSubmit={handleNewsletter} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ fontSize: "0.8rem" }}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}>
          <p style={{ color: "var(--text-faint)", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} Trend Vogue. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy Policy", "Terms of Service", "Shipping Policy"].map((t) => (
              <a
                key={t}
                href="#"
                style={{ color: "var(--text-faint)", fontSize: "0.8rem", textDecoration: "none" }}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
