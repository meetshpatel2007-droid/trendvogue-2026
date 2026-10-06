import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "64px", minHeight: "100vh" }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
