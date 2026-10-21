
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "./Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat'Perlipopette | Location de jeux de société",
  description:
    "Découvrez et louez des jeux de société avec Chat'Perlipopette.",
  verification: {
    google:"2LoZ38vIMfSQqvj3e4ahmBGGCh-U8e_saH3gk1TWPsk" />,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
