"use client";

import Header from "../components/ui/header";
import Footer from "../components/ui/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import { CookieBanner } from "@/components/ui/cookie-banner";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="min-h-screen h-full flex flex-col">
        <ToastProvider />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}