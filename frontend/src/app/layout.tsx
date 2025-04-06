import Header from "../components/ui/header";
import Footer from "../components/ui/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import { CookieBanner } from "@/components/ui/cookie-banner";
import "./globals.css";
import { API_BASE_URL } from "@/config/api"

export const metadata = {
  title: "CInbora Transparecer",
  icons: {
    icon: "/cinboratransparecer/favicon.ico",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="pt-br" className="h-full">
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