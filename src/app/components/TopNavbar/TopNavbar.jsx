// components/TopNavbar/TopNavbar.js
"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaStar,
  FaRegStar,
  FaSpinner,
} from "react-icons/fa";

const TopNavbar = () => {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0); // Added cart count state

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Helper function to safely format price
  const formatPrice = (price) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

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

  // Fetch all products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3000/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setAllProducts(data.data || []);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(data.data.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products for search:", error);
        setIsLoading(false);
      }
    };
    fetchProducts();

    // Set search query from URL on component mount
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced filter function
  const debouncedFilterProducts = useCallback(
    (query) => {
      if (query.trim() === "") {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      // Filter products based on search query
      const filteredProducts = allProducts.filter((product) => {
        const searchTerm = query.toLowerCase();
        const name = (product.name || "").toLowerCase();
        const brand = (product.brand || "").toLowerCase();
        const category = (product.category || "").toLowerCase();

        // Exact match
        if (
          name.includes(searchTerm) ||
          brand.includes(searchTerm) ||
          category.includes(searchTerm)
        ) {
          return true;
        }

        // Partial match with tolerance for typos
        const nameWords = name.split(" ");
        const brandWords = brand.split(" ");
        const categoryWords = category.split(" ");

        return (
          nameWords.some((word) => word.includes(searchTerm)) ||
          brandWords.some((word) => word.includes(searchTerm)) ||
          categoryWords.some((word) => word.includes(searchTerm))
        );
      });

      setSearchResults(filteredProducts.slice(0, 5)); // Limit to 5 results in dropdown
      setShowSuggestions(true);
    },
    [allProducts],
  );

  // Handle search input change with debouncing
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      debouncedFilterProducts(value);
    }, 300); // 300ms delay
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCategoryClick = (category) => {
    router.push(`/category/${encodeURIComponent(category)}`);
    setIsCategoryDropdownOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

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

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/all-products", label: "All Products" },
    { href: "/deals", label: "Deals" },
    { href: "/about-us", label: "About" },
    { href: "/manage-add-to-cart", label: "Cart" }, // Added cart link
  ];

  // Popular categories to show first
  const popularCategories = ["Makeup", "Skincare", "Hair Care", "Fragrance"];
  const sortedCategories = [
    ...popularCategories.filter((cat) => categories.includes(cat)),
    ...categories.filter((cat) => !popularCategories.includes(cat)),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-lg" : "bg-white shadow-sm"}`}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                YourBrand
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  pathname === link.href
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${
                  pathname.startsWith("/category")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                Categories
                <FaChevronDown
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Category Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="py-2">
                    {sortedCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span>{category}</span>
                          <span className="text-xs text-gray-400">
                            {
                              allProducts.filter((p) => p.category === category)
                                .length
                            }{" "}
                            items
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <Link
                      href="/categories"
                      className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View All Categories
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right-side Actions (Search, Profile, Cart) */}
          <div className="flex items-center space-x-2">
            {/* Search Bar (Desktop) */}
            <div className="hidden md:block" ref={searchContainerRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search products..."
                    className="w-48 lg:w-64 px-4 py-2 pr-10 text-sm text-gray-700 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {isLoading ? (
                      <FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
                    ) : (
                      <FaSearch className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <ul className="py-1">
                    {searchResults.map((product) => (
                      <li key={product._id}>
                        <Link
                          href={`/product/${product._id}`}
                          className="block px-4 py-3 hover:bg-gray-100 flex items-center"
                          onClick={handleSuggestionClick}
                        >
                          <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                            <Image
                              src={
                                product.imageUrls?.[0] ||
                                product.imageUrl ||
                                `https://picsum.photos/seed/${product._id}/100/100.jpg`
                              }
                              alt={product.name || "Product"}
                              fill
                              sizes="48px"
                              className="object-cover rounded"
                              unoptimized={
                                product.imageUrls?.[0]?.includes(
                                  "example.com",
                                ) || product.imageUrl?.includes("example.com")
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name || "Unnamed Product"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.brand || "Unknown Brand"}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center">
                                {renderRating(product.rating)}
                                <span className="ml-1 text-xs text-gray-600">
                                  ({product.rating || 0})
                                </span>
                              </div>
                              <div>
                                {product.discount > 0 ? (
                                  <>
                                    <span className="text-sm font-bold text-gray-900">
                                      ${formatPrice(product.finalPrice)}
                                    </span>
                                    <span className="text-xs text-gray-500 line-through ml-1">
                                      ${formatPrice(product.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-bold text-gray-900">
                                    $
                                    {formatPrice(
                                      product.finalPrice || product.price,
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button
                      onClick={handleSearch}
                      className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all results for `{searchQuery}`
                    </button>
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {showSuggestions &&
                searchQuery &&
                searchResults.length === 0 &&
                !isLoading && (
                  <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-6 text-center">
                      <FaSearch className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">
                        No products found for `{searchQuery}`
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try different keywords
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200"
              >
                {status === "loading" ? (
                  <div className="h-6 w-6 rounded-full bg-gray-300 animate-pulse"></div>
                ) : session ? (
                  <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {session.user.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                ) : (
                  <FaUser className="h-6 w-6" />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {status === "loading" ? (
                    <div className="px-4 py-3 text-center">
                      <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mx-auto mb-2"></div>
                      <div className="h-3 w-32 bg-gray-300 rounded animate-pulse mx-auto"></div>
                    </div>
                  ) : session ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user.email}
                        </p>
                        {session.user.role && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                            {session.user.role === "admin" ? "Admin" : "User"}
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/manage-my-order"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        {session.user.role === "admin" && (
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleSignOut();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-1">
                      <Link
                        href="/sign-in"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Icon with Badge */}
            <Link
              href="/manage-add-to-cart"
              className="p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 relative transition-all duration-200"
            >
              <FaShoppingCart className="h-6 w-6" />
              {/* Cart Badge */}
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <FaBars className="h-6 w-6" />
              ) : (
                <FaTimes className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel with search */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-screen" : "max-h-0"}`}
      >
        <div className="px-4 pt-4 pb-3 space-y-3 bg-white border-t border-gray-200">
          {/* Mobile Search Bar */}
          <div className="relative" ref={searchContainerRef}>
            <form onSubmit={handleSearch}>
              <div className="relative right-1/2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="w-full top-24 left-0  px-4 py-2 pr-10 text-sm text-gray-700 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {isLoading ? (
                    <FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    <FaSearch className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </form>

            {/* Mobile Search Results Dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <ul className="py-1">
                  {searchResults.map((product) => (
                    <li key={product._id}>
                      <Link
                        href={`/product/${product._id}`}
                        className="block px-4 py-3 hover:bg-gray-100 flex items-center"
                        onClick={handleSuggestionClick}
                      >
                        <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                          <Image
                            src={
                              product.imageUrls?.[0] ||
                              product.imageUrl ||
                              `https://picsum.photos/seed/${product._id}/100/100.jpg`
                            }
                            alt={product.name || "Product"}
                            fill
                            sizes="48px"
                            className="object-cover rounded"
                            unoptimized={
                              product.imageUrls?.[0]?.includes("example.com") ||
                              product.imageUrl?.includes("example.com")
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name || "Unnamed Product"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.brand || "Unknown Brand"}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center">
                              {renderRating(product.rating)}
                              <span className="ml-1 text-xs text-gray-600">
                                ({product.rating || 0})
                              </span>
                            </div>
                            <div>
                              {product.discount > 0 ? (
                                <>
                                  <span className="text-sm font-bold text-gray-900">
                                    ${formatPrice(product.finalPrice)}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through ml-1">
                                    ${formatPrice(product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-gray-900">
                                  $
                                  {formatPrice(
                                    product.finalPrice || product.price,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={handleSearch}
                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View all results for `{searchQuery}`
                  </button>
                </div>
              </div>
            )}

            {/* Mobile No Results Message */}
            {showSuggestions &&
              searchQuery &&
              searchResults.length === 0 &&
              !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-6 text-center">
                    <FaSearch className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      No products found for `{searchQuery}`
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try different keywords
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Navigation Links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Categories Section */}
          <div className="pt-2 border-t border-gray-100">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Categories
            </h3>
            <div className="space-y-1">
              {sortedCategories.slice(0, 6).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="block w-full text-left px-3 py-2 text-base text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span>{category}</span>
                    <span className="text-xs text-gray-400">
                      {
                        allProducts.filter((p) => p.category === category)
                          .length
                      }
                    </span>
                  </div>
                </button>
              ))}
              {categories.length > 6 && (
                <Link
                  href="/categories"
                  className="block px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All Categories →
                </Link>
              )}
            </div>
          </div>

          {/* Mobile User Section */}
          <div className="pt-2 border-t border-gray-100">
            {status === "loading" ? (
              <div className="px-3 py-2">
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ) : session ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </p>
                  {session.user.role && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                      {session.user.role === "admin" ? "Admin" : "User"}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/manage-my-order"
                    className="block px-3 py-2 text-base text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-3 py-2 text-base text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Wishlist
                  </Link>
                  <Link
                    href="/manage-add-to-cart"
                    className="block px-3 py-2 text-base text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    My Cart
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-base text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/sign-in"
                  className="block px-3 py-2 text-base text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="block px-3 py-2 text-base text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
