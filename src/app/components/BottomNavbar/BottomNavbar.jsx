"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; // 1. Import useSession
import { FaHome, FaList, FaShoppingCart, FaUser } from "react-icons/fa";

const BottomNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession(); // 2. Get session status
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const userId =
          localStorage.getItem("userId") || "guest-user-" + Date.now();

        const response = await fetch(`/api/cart?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
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

  // 3. Logic to determine where the Account button should go
  // If authenticated -> /profile, otherwise -> /sign-in
  const accountLink = status === "authenticated" ? "/account" : "/sign-in";

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: <FaHome size={24} />,
      href: "/",
    },
    {
      id: "categories",
      label: "Categories",
      icon: <FaList size={24} />,
      href: "/categories", // Or /all-products
    },
    {
      id: "cart",
      label: "Cart",
      icon: <FaShoppingCart size={24} />,
      href: "/manage-add-to-cart",
    },
    {
      id: "account",
      label: "Account",
      icon: <FaUser size={24} />,
      // We will override this href in the render, but keeping a default here
      href: "/sign-in",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white text-black border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          // 4. Dynamic link logic
          const href = item.id === "account" ? accountLink : item.href;

          // Check active state
          const isActive = pathname === href;

          return (
            <Link
              key={item.id}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full relative ${
                isActive ? "text-indigo-600" : "text-gray-500"
              } transition-colors duration-200`}
            >
              <div className="relative">
                {item.icon}
                {/* Show cart count badge for cart item */}
                {item.id === "cart" && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full min-w-[1.25rem]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
