// src/app/LayoutContent.js
"use client";
import { Suspense } from "react";
import BottomNavbar from "@/app/components/BottomNavbar/BottomNavbar";
import SearchBar from "@/app/components/SearchBar/page";
import TopNavbar from "@/app/components/TopNavbar/TopNavbar";
import { usePathname } from "next/navigation";
import WhatsAppButton from "@/app/components/WhatsAppButton/WhatsAppButton";
// import BottomNavbar from "./components/BottomNavbar/BottomNavbar";
// import SearchBar from "./components/SearchBar/page";
// import TopNavbar from "./components/TopNavbar/TopNavbar";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      <main className="flex-grow">
        {/* TOP NAVBAR: Hidden on dashboard */}
        {!isDashboard && (
          <div className=" md:flex mb-16">
            <Suspense
              fallback={<div className="h-16 bg-white shadow-sm mb-6" />}
            >
              <TopNavbar />
            </Suspense>
          </div>
        )}
        <WhatsAppButton />
        {/* CONTENT WRAPPER: Provides padding and a card-like background for content */}
        <div className={`${!isDashboard && "my-16 md:my-20"}`}>
          <div className="">{children}</div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVBAR: Fixed at the bottom of the screen on mobile, but not on dashboard */}
      {!isDashboard && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0  shadow-lg bg-gray-300">
          <BottomNavbar />
        </nav>
      )}
    </div>
  );
}
