import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Doručenie | Delivery performance, made visible",
    template: "%s | Doručenie",
  },
  description:
    "Doručenie helps ecommerce teams see delivery performance, SLA risk, and courier reliability in one clear workspace.",
  applicationName: "Doručenie",
  authors: [{ name: "Doručenie" }],
  creator: "Doručenie",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Doručenie",
    title: "Doručenie | Delivery performance, made visible",
    description:
      "See delivery performance, SLA risk, and courier reliability in one clear workspace.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Doručenie | Delivery performance, made visible",
    description:
      "See delivery performance, SLA risk, and courier reliability in one clear workspace.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
