import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "./Footer";
import "./globals.css";

const siteUrl = "https://chatperlipopette.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chat’Perlipopette | Location de jeux de société à Toulouse",
    template: "%s | Chat’Perlipopette",
  },
  description:
    "Louez des jeux de société avec Chat’Perlipopette : un catalogue de centaines de jeux pour vos soirées, week-ends et événements dans le secteur de Toulouse et en Haute-Garonne.",
  applicationName: "Chat’Perlipopette",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Chat’Perlipopette",
    title: "Chat’Perlipopette | Location de jeux de société à Toulouse",
    description:
      "Découvrez et louez des jeux de société pour vos soirées, week-ends et événements autour de Toulouse.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "O4f2VJH-0vn6-NrZ_BNlRyyYW62XSSYu0LTPHXPfRbo",
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
