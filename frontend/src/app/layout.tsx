import Header from "../components/ui/header";
import Main from "../components/ui/main";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header/>
        <Main/>
      </body>
    </html>
  );
}
