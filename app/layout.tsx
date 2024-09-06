
import type { Metadata } from "next";

import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import TopNav from '../components/navigation/topnav'
import { poppins } from "@/utils/fonts";
 
import { Analytics } from "@vercel/analytics/react"

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
      
      <body className={poppins.className}>
        <TopNav />
        {children}
        <Analytics />
      </body>
    </html>
  );
}