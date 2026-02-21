"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BottomNavbar = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [cartCount, setCartCount] = useState(0); // State to track cart items

  // Fetch cart count when component mounts
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        // Get user ID from localStorage
        const userId =
          localStorage.getItem("userId") || "guest-user-" + Date.now();

        const response = await fetch(`/api/cart?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Calculate total items in cart
            const totalItems = data.data.reduce(
              (total, item) => total + item.quantity,
              0,
            );
            setCartCount(totalItems);
          }
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();
  }, []);

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001 1v-4a1 1 0 011-1h2a1 1 0 011-1v-4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: "/",
    },
    {
      id: "review",
      label: "Review",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.951.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00.363-1.118l-1.518 4.674a1 1 0 00.951.69l1.519-4.674z"
          />
        </svg>
      ),
      href: "/review",
    },
    {
      id: "cart",
      label: "Cart",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      href: "/manage-add-to-cart",
    },
    {
      id: "account",
      label: "Account",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      href: "/sign-up",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-200 text-black border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center"
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
            {/* Show cart count badge for cart item */}
            {item.id === "cart" && cartCount > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;
