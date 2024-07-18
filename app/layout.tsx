
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNav from '../components/navigation/topnav'


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moonstone",
  description: "helpful project tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
          <TopNav />
          {children}

      </body>
    </html>
  );
}
