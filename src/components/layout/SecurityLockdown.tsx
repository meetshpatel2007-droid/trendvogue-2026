import { ShieldAlert } from "lucide-react";

/**
 * Full-screen security warning shown on every page while the site is
 * believed to be compromised. It has no close button and blocks the page
 * underneath (the root layout also marks the page content `inert`).
 *
 * It is a server component, so it is in the HTML before any JavaScript runs.
 * To lift the lockdown, remove <SecurityLockdown /> and the `inert` wrapper
 * from src/app/layout.tsx and redeploy.
 */
export function SecurityLockdown() {
  return (
    <>
      {/* Stop the page underneath from scrolling */}
      <style>{`html, body { overflow: hidden !important; }`}</style>

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="security-lockdown-title"
        aria-describedby="security-lockdown-desc"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2147483647, // above the intro (9999) and every other layer
          background: "rgba(6, 8, 10, 0.97)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily: "var(--font-body), system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            background: "#11161D",
            border: "1px solid rgba(229, 83, 75, 0.5)",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center",
            color: "#F0F6FC",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6)",
          }}
        >
          <ShieldAlert size={52} color="#E5534B" style={{ margin: "0 auto 1rem" }} />
          <h1
            id="security-lockdown-title"
            style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}
          >
            This website is being hacked
          </h1>
          <div id="security-lockdown-desc" style={{ color: "#C9D1D9", fontSize: "0.95rem", lineHeight: 1.6 }}>
            <p style={{ marginBottom: "0.75rem" }}>
              We have detected a security attack on Trend Vogue and have paused the store
              to protect you.
            </p>
            <p>
              Please do not log in, enter passwords or payment details, or place orders
              until we confirm the site is safe again.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
