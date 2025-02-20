import Header from "../components/ui/header";
import Main from "../components/ui/main";
import Footer from "../components/ui/footer";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="min-h-screen h-full flex flex-col">
        <Header />
        <main className="flex-grow">
          <Main />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
