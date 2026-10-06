import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin Dashboard", template: "%s | Admin — Trend Vogue" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "var(--bg)",
    }}>
      <AdminSidebar />
      <main style={{
        flex: 1,
        marginLeft: "240px",
        minHeight: "100vh",
        padding: "2rem",
        overflowX: "hidden",
      }}>
        {children}
      </main>
    </div>
  );
}
