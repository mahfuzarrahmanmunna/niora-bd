// src/app/components/TopNavbar/TopNavbar.jsx
"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
  FaHeart,
  FaStar,
  FaRegStar,
  FaSpinner,
  FaChevronDown,
  FaHome,
  FaBox,
  FaTags,
  FaPercent,
  FaHeadset,
  FaStore,
  FaTruck,
} from "react-icons/fa";

// Wrap the component in Suspense to fix the useSearchParams warning
function TopNavbarWrapper() {
  return (
    <Suspense fallback={<div className="h-16 bg-white shadow-sm"></div>}>
      <TopNavbar />
    </Suspense>
  );
}

function TopNavbar() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const cartRef = useRef(null);
  const searchRef = useRef(null);
  const categoryRef = useRef(null);

  // Fetch cart items and categories on mount
  useEffect(() => {
    fetchCartItems();
    fetchCategories();

    // Set search query from URL
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      if (data.success) {
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/products");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const uniqueCategories = [
          ...new Set(data.data.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/products/search?q=${encodeURIComponent(searchQuery)}`,
        );
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (response.ok) {
        setCartItems(cartItems.filter((item) => item._id !== productId));
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // Helper function to safely format price
  const formatPrice = (price) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice =
      typeof item.finalPrice === "string"
        ? parseFloat(item.finalPrice)
        : item.finalPrice || 0;
    return total + itemPrice * (item.quantity || 1);
  }, 0);

  // Function to render star rating
  const renderRating = (rating) => {
    const ratingValue = parseFloat(rating) || 0;
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 !== 0;
    const emptyStars = 5 - Math.ceil(ratingValue);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="w-3 h-3 text-yellow-400" />
        ))}
        {hasHalfStar && <FaStar className="w-3 h-3 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
        ))}
        <span className="ml-1 text-xs text-gray-600">({ratingValue})</span>
      </div>
    );
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-indigo-600 text-white text-center py-2 text-sm">
        <p>Free shipping on orders over $50! Use code: FREESHIP</p>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-600">
                YourStore
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Categories Dropdown */}
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                >
                  Categories
                  <FaChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {categories.map((category) => (
                        <Link
                          key={category}
                          href={`/products?category=${category.toLowerCase()}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                        >
                          {category.replace("-", " ")}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/deals"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                Deals
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                Contact
              </Link>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-gray-700 hover:text-indigo-600"
                >
                  <FaSearch className="h-5 w-5" />
                </button>
                {isSearchOpen && (
                  <div className="absolute -right-44 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-4">
                    <form onSubmit={handleSearch}>
                      <div className="flex">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                        >
                          {isLoading ? (
                            <FaSpinner className="h-4 w-4 animate-spin" />
                          ) : (
                            <FaSearch />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* User Account */}
              <Link
                href="/account"
                className="p-2 text-gray-700 hover:text-indigo-600"
              >
                <FaUser className="h-5 w-5" />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 text-gray-700 hover:text-indigo-600 relative"
              >
                <FaHeart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* Cart */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="p-2 text-gray-700 hover:text-indigo-600 relative"
                >
                  <FaShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {cartItems.reduce(
                        (sum, item) => sum + (item.quantity || 1),
                        0,
                      )}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="max-h-96 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Your cart is empty
                        </div>
                      ) : (
                        <>
                          {cartItems.map((item) => (
                            <div key={item._id} className="p-4 border-b">
                              <div className="flex items-center">
                                <div className="relative w-16 h-16 mr-3">
                                  <Image
                                    src={
                                      item.imageUrls?.[0] ||
                                      item.imageUrl ||
                                      "/placeholder.jpg"
                                    }
                                    alt={item.name}
                                    fill
                                    className="object-cover rounded"
                                    unoptimized={
                                      item.imageUrls?.[0]?.includes(
                                        "example.com",
                                      ) ||
                                      item.imageUrl?.includes("example.com")
                                    }
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {item.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    ${formatPrice(item.finalPrice)} x{" "}
                                    {item.quantity || 1}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item._id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTimes className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    {cartItems.length > 0 && (
                      <div className="p-4 border-t">
                        <div className="flex justify-between mb-3">
                          <span className="text-sm font-medium">Total:</span>
                          <span className="text-sm font-bold">
                            ${formatPrice(cartTotal)}
                          </span>
                        </div>
                        <Link
                          href="/cart"
                          className="block w-full text-center bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                          onClick={() => setIsCartOpen(false)}
                        >
                          View Cart
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/products"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaBox className="inline mr-2" />
                All Products
              </Link>
              <Link
                href="/deals"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaPercent className="inline mr-2" />
                Deals
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaHeadset className="inline mr-2" />
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default TopNavbarWrapper;
