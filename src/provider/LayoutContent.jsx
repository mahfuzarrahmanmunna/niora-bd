// src/app/LayoutContent.js
"use client";
import BottomNavbar from "@/app/components/BottomNavbar/BottomNavbar";
import SearchBar from "@/app/components/SearchBar/page";
import TopNavbar from "@/app/components/TopNavbar/TopNavbar";
import { usePathname } from "next/navigation";
// import BottomNavbar from "./components/BottomNavbar/BottomNavbar";
// import SearchBar from "./components/SearchBar/page";
// import TopNavbar from "./components/TopNavbar/TopNavbar";

export default function LayoutContent({ children }) {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith('/dashboard');

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 mb-12">
            <main className="flex-grow">
                {/* MOBILE SEARCH BAR: Visible only on small screens and not on dashboard */}
                {!isDashboard && (
                    <div className="md:hidden">
                        <SearchBar />
                    </div>
                )}

                {/* TOP NAVBAR: Hidden on dashboard */}
                {!isDashboard && (
                    <div className="hidden md:flex">
                        <TopNavbar />
                    </div>
                )}

                {/* CONTENT WRAPPER: Provides padding and a card-like background for content */}
                <div className="">
                    <div className="">
                        {children}
                    </div>
                </div>
            </main>

            {/* MOBILE BOTTOM NAVBAR: Fixed at the bottom of the screen on mobile, but not on dashboard */}
            {!isDashboard && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg bg-gray-300">
                    <BottomNavbar />
                </nav>
            )}
        </div>
    );
}