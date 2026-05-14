// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Providers from "@/provider/Provider";
import LayoutContent from "@/provider/LayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Dilidoor - Premium Fashion & Cosmetics",
    template: "%s | Dilidoor",
  },
  description:
    "Shop the latest trends in fashion, cosmetics, and accessories at Dilidoor. Discover top brands like Nike, Zara, and more with exclusive deals and fast delivery.",
  keywords: [
    "Dilidoor",
    "Online Shopping",
    "Fashion",
    "Cosmetics",
    "Nike",
    "Zara",
    "Accessories",
    "Makeup",
    "Skincare",
  ],
  authors: [{ name: "Dilidoor" }],
  openGraph: {
    title: "Dilidoor",
    description:
      "Shop the latest trends in fashion, cosmetics, and accessories at Dilidoor.",
    type: "website",
    locale: "en_US",
    siteName: "Dilidoor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dilidoor",
    description:
      "Shop the latest trends in fashion, cosmetics, and accessories at Dilidoor.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];
            w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KZJDCLWF');
          `}
        </Script>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900 min-h-screen`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KZJDCLWF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
