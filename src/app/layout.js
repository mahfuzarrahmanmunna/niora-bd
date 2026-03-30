// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script"; // <--- Added Script import
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
    "Shop the latest trends in fashion, cosmetics, and accessories at Dilodoor. Discover top brands like Nike, Zara, and more with exclusive deals and fast delivery.",
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
    title: "Dilodoor",
    description:
      "Shop the latest trends in fashion, cosmetics, and accessories at Dilidoor.",
    type: "website",
    locale: "en_US",
    siteName: "Dilidoor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dilodoor",
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
        cz-shortcut-listen="true"
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900 min-h-screen`}
      >
        {/* --- FACEBOOK PIXEL CODE START --- */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1447847387033366');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1447847387033366&ev=PageView&noscript=1"
          />
        </noscript>
        {/* --- FACEBOOK PIXEL CODE END --- */}

        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
