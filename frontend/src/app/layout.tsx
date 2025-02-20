import Header from "../components/ui/header";
import Main from "../components/ui/main";
<<<<<<< HEAD
=======
import Footer from "../components/ui/footer";
>>>>>>> e0e1566c (footer)
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en">
      <body>
        <Header/>
        <Main/>
=======
    <html lang="pt-br" className="h-full">
      <body className="min-h-screen h-full flex flex-col">
        <Header />
        <main className="flex-grow">
          <Main />
          {children}
        </main>
        <Footer />
>>>>>>> e0e1566c (footer)
      </body>
    </html>
  );
}
