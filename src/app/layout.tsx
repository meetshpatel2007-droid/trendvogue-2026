import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthInitializer } from "@/components/layout/AuthInitializer";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trend Vogue — Premium Clothing Store",
    template: "%s | Trend Vogue",
  },
  description:
    "Shop premium clothing for Men, Women, Kids & Beauty at Trend Vogue. Free delivery, easy returns, and exclusive styles.",
  keywords: ["clothing", "fashion", "online shopping", "men", "women", "kids", "beauty"],
  authors: [{ name: "Trend Vogue" }],
  creator: "Trend Vogue",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Trend Vogue",
    title: "Trend Vogue — Premium Clothing Store",
    description:
      "Shop premium clothing for Men, Women, Kids & Beauty at Trend Vogue.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trend Vogue — Premium Clothing Store",
    description:
      "Shop premium clothing for Men, Women, Kids & Beauty at Trend Vogue.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0F1111" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthInitializer />
          {children}
          <Toaster
            position="top-right"
            richColors
            expand
            closeButton
            toastOptions={{
              style: {
                fontFamily: "var(--font-body)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
