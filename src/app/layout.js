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
    default: "Dilodoor - Premium Fashion & Cosmetics",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900 min-h-screen`}
      >
        {/* --- GOOGLE TAG MANAGER 1 START --- */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PX47H7CH');
            `,
          }}
        />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PX47H7CH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* --- GOOGLE TAG MANAGER 1 END --- */}

        {/* --- GOOGLE TAG MANAGER 2 START --- */}
        <Script
          id="google-tag-manager-new"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-N4533L2S');
            `,
          }}
        />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N4533L2S"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* --- GOOGLE TAG MANAGER 2 END --- */}

        {/* 
           I REMOVED THE FACEBOOK PIXEL CODE FROM HERE. 
           It should be managed inside your Google Tag Manager account 
           to avoid the "Duplicate Pixel" error.
        */}

        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
