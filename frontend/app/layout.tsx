import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.kkengineering.com"; // replace with your actual domain

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "KK Engineering | HVAC & AC Ducting Solutions",
    template: "%s | KK Engineering",
  },

  description:
    "KK Engineering provides professional HVAC, AC ducting, duct fabrication, installation and engineering solutions.",

  keywords: [
    "KK Engineering",
    "HVAC",
    "AC ducting",
    "HVAC ducting",
    "duct fabrication",
    "AC duct installation",
    "HVAC contractor",
    "ducting work",
    "air conditioning ducting",
  ],

  authors: [{ name: "KK Engineering" }],
  creator: "KK Engineering",
  publisher: "KK Engineering",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "KK Engineering | HVAC & AC Ducting Solutions",
    description:
      "Professional HVAC, AC ducting, duct fabrication and installation solutions by KK Engineering.",
    url: siteUrl,
    type: "website",
    siteName: "KK Engineering",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.jpg", // add an actual 1200x630 image in /public
        width: 1200,
        height: 630,
        alt: "KK Engineering - HVAC & AC Ducting Solutions",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "KK Engineering | HVAC & AC Ducting Solutions",
    description:
      "Professional HVAC, AC ducting, fabrication and installation solutions.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

