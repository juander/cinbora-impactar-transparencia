"use client";

import Header from "../components/ui/header";
import Footer from "../components/ui/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import { CookieBanner } from "@/components/ui/cookie-banner";
import "./globals.css";
import { useEffect } from "react"
import { API_BASE_URL } from "@/config/api"

export default function RootLayout({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const hasReloaded = sessionStorage.getItem("hasReloaded")
      if (!hasReloaded) {
        sessionStorage.setItem("hasReloaded", "true")
        window.location.reload()
      }
    }
  }, [])

  return (
    <html lang="pt-br" className="h-full">
      <head>
        <link rel="icon" href="/cinboratransparecer/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/cinboratransparecer/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen h-full flex flex-col">
        <ToastProvider />
        <Header />
        <main className="flex-grow" style={{ 
          background: "linear-gradient(to bottom, #ffffff, #f2faff)"
        }}>
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}