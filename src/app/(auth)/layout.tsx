import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Trend Vogue account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--gradient-hero)",
      padding: "2rem 1rem",
      position: "relative",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse 50% 60% at 50% 30%, rgba(33,98,161,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "block",
          textAlign: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "1.75rem",
          letterSpacing: "-0.03em",
          marginBottom: "2rem",
          textDecoration: "none",
          color: "var(--text-primary)",
        }}>
          TREND
          <span style={{
            background: "var(--gradient-gold)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}> VOGUE</span>
        </Link>

        {children}
      </div>
    </div>
  );
}
