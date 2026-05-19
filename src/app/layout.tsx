import type { Metadata } from "next";
import { Montserrat, Playball } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const playball = Playball({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-playball",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MainHR Gigs – Freelance Marketplace for Top Talent",
  description:
    "Connect with skilled freelancers or find your next gig. MainHR Gigs is Uganda's premier dual-audience marketplace — bridging hiring managers with exceptional service providers through a trusted, technology-driven platform.",
  keywords: [
    "freelance marketplace",
    "hire freelancers",
    "find gigs",
    "Uganda freelancers",
    "MainHR",
    "remote work",
    "talent marketplace",
  ],
  openGraph: {
    title: "MainHR Gigs – Freelance Marketplace for Top Talent",
    description:
      "Connect with skilled freelancers or find your next gig on MainHR Gigs.",
    type: "website",
    locale: "en_US",
    siteName: "MainHR Gigs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${montserrat.variable} ${playball.variable}`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
