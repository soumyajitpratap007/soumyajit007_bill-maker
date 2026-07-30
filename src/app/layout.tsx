import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterSW } from "./register-sw";

export const metadata: Metadata = {
  title: {
    default: "Bill Maker — GST Invoices, Quotations & Receipts in seconds",
    template: "%s • Bill Maker",
  },
  description:
    "India's fastest bill generator. GST tax invoices, quotations, receipts, delivery challans and POs. Beautiful templates, instant PDF, WhatsApp & email share.",
  applicationName: "Bill Maker",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Bill Maker" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  openGraph: {
    title: "Bill Maker — GST Invoices in seconds",
    description: "Beautiful, GST-ready bills. Free. Mobile-first. Instant PDF & WhatsApp share.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
