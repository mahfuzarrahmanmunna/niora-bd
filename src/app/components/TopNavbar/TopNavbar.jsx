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
  FaHome,
  FaBox,
  FaInfoCircle,
  FaHeart,
  FaSignOutAlt,
  FaUserCircle,
  FaThLarge,
} from "react-icons/fa"; // Added more icons
import { useCart } from "@/app/context/CartContext";
import SearchBar from "../SearchBar/page";

const TopNavbar = () => {
  const { data: session, status } = useSession();
  const { cartCount } = useCart();

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
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const hasFetchedProductsRef = useRef(false);

  const formatPrice = (price) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (hasFetchedProductsRef.current) return;
      hasFetchedProductsRef.current = true;

      try {
        setIsLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setAllProducts(data.data || []);

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

    const query = searchParams.get("q");
    if (query) setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(event.target)
      ) {
        setIsMobileSearchFocused(false);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const debouncedFilterProducts = useCallback(
    (query) => {
      if (query.trim() === "") {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      const filteredProducts = allProducts.filter((product) => {
        const searchTerm = query.toLowerCase();
        const name = (product.name || "").toLowerCase();
        const brand = (product.brand || "").toLowerCase();
        const category = (product.category || "").toLowerCase();

        if (
          name.includes(searchTerm) ||
          brand.includes(searchTerm) ||
          category.includes(searchTerm)
        ) {
          return true;
        }

        const nameWords = name.split(" ");
        const brandWords = brand.split(" ");
        const categoryWords = category.split(" ");

        return (
          nameWords.some((word) => word.includes(searchTerm)) ||
          brandWords.some((word) => word.includes(searchTerm)) ||
          categoryWords.some((word) => word.includes(searchTerm))
        );
      });

      setSearchResults(filteredProducts.slice(0, 5));
      setShowSuggestions(true);
    },
    [allProducts],
  );

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      debouncedFilterProducts(value);
    }, 300);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setIsMobileSearchFocused(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
    setIsMobileSearchFocused(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCategoryClick = (category) => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

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
    { href: "/", label: "Home", icon: <FaHome className="w-5 h-5" /> },
    {
      href: "/all-products",
      label: "All Products",
      icon: <FaBox className="w-5 h-5" />,
    },
    {
      href: "/about-us",
      label: "About",
      icon: <FaInfoCircle className="w-5 h-5" />,
    },
  ];

  const popularCategories = ["Makeup", "Skincare", "Hair Care", "Fragrance"];
  const sortedCategories = [
    ...popularCategories.filter((cat) => categories.includes(cat)),
    ...categories.filter((cat) => !popularCategories.includes(cat)),
  ];

  return (
    <>
      {/* --- DESKTOP HEADER --- */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md" : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dilodoor
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
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

              {/* Desktop Category Dropdown */}
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
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      isCategoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
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
                                allProducts.filter(
                                  (p) => p.category === category,
                                ).length
                              }{" "}
                              items
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Desktop Search Component */}
              <div className="hidden md:block" ref={searchContainerRef}>
                <SearchBar />
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none transition-all"
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

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    {status === "loading" ? (
                      <div className="px-4 py-3 text-center">
                        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mx-auto mb-2"></div>
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
                        </div>
                        <div className="py-1">
                          <Link
                            href="/account"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Profile
                          </Link>
                          <Link
                            href="/manage-my-order"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            My Orders
                          </Link>

                          {session.user.role === "admin" && (
                            <Link
                              href="/dashboard"
                              className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
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
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <Link
                          href="/sign-in"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/sign-up"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <Link
                href="/manage-add-to-cart"
                className="p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100 relative transition-all"
              >
                <FaShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Search Trigger (New) */}
              <button
                onClick={() => setIsMobileSearchFocused(true)}
                className="md:hidden p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
              >
                <FaSearch className="h-6 w-6" />
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none transition-all"
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
      </header>

      {/* --- MOBILE SIDEBAR MENU (Off-Canvas) --- */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileMenu}
      />

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Menu</h2>
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* User Section */}
          {session ? (
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          ) : (
            <Link
              href="/sign-in"
              onClick={toggleMobileMenu}
              className="flex items-center justify-center w-full py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-md hover:bg-indigo-700 transition-colors"
            >
              Sign In / Register
            </Link>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={toggleMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Categories (Grid Layout) */}
          <div>
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {sortedCategories.slice(0, 6).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-transparent hover:border-indigo-100"
                >
                  <span className="truncate">{category}</span>
                  <FaChevronDown className="w-3 h-3 text-gray-400" />
                </button>
              ))}
            </div>
            {categories.length > 6 && (
              <Link
                href="/categories"
                onClick={toggleMobileMenu}
                className="mt-3 block text-center text-sm text-indigo-600 font-medium hover:underline"
              >
                View All Categories
              </Link>
            )}
          </div>

          {/* Account Links (If Logged In) */}
          {session && (
            <div className="pt-4 border-t border-gray-100 space-y-1">
              <Link
                href="/account"
                onClick={toggleMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <FaUserCircle className="w-5 h-5" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/manage-my-order"
                onClick={toggleMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <FaBox className="w-5 h-5" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/wishlist"
                onClick={toggleMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <FaHeart className="w-5 h-5" />
                <span>Wishlist</span>
              </Link>
              {session.user.role === "admin" && (
                <Link
                  href="/dashboard"
                  onClick={toggleMobileMenu}
                  className="flex items-center space-x-3 px-4 py-3 text-base text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  <FaThLarge className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={() => {
                  toggleMobileMenu();
                  handleSignOut();
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- MOBILE SEARCH OVERLAY --- */}
      {isMobileSearchFocused && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Search Header */}
          <div className="flex items-center p-4 border-b border-gray-100 shadow-sm bg-white sticky top-0 z-10">
            <button
              onClick={() => setIsMobileSearchFocused(false)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 mr-4"
            >
              Cancel
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search products..."
                  className="w-full px-4 py-2.5 text-base text-gray-900 bg-gray-100 border-transparent rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {isLoading ? (
                    <FaSpinner className="h-5 w-5 text-indigo-500 animate-spin" />
                  ) : (
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {showSuggestions && searchResults.length > 0 ? (
              <div className="p-2">
                <ul className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {searchResults.map((product) => (
                    <li key={product._id}>
                      <Link
                        href={`/product/${product._id}`}
                        className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center"
                        onClick={handleSuggestionClick}
                      >
                        <div className="relative w-16 h-16 mr-4 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          {/* Real Image Logic */}
                          <Image
                            src={
                              product.imageUrls && product.imageUrls.length > 0
                                ? product.imageUrls[0]
                                : product.imageUrl ||
                                  `https://picsum.photos/seed/${product._id}/100/100.jpg`
                            }
                            alt={product.name || "Product"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {product.name || "Unnamed Product"}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            {product.brand || "Unknown Brand"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {renderRating(product.rating)}
                            </div>
                            <div className="text-right">
                              {product.discount > 0 ? (
                                <>
                                  <span className="text-sm font-bold text-gray-900">
                                    ${formatPrice(product.finalPrice)}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through ml-1 block">
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
                <div className="mt-3 px-2">
                  <button
                    onClick={handleSearch}
                    className="w-full text-center text-sm text-indigo-600 font-medium py-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    View all results for`{searchQuery}`
                  </button>
                </div>
              </div>
            ) : showSuggestions && searchQuery && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium text-lg mb-1">
                  No products found
                </p>
                <p className="text-gray-500 text-sm">
                  Try checking your spelling or using different keywords
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-gray-900 font-medium text-lg mb-1">
                  What are you looking for?
                </p>
                <p className="text-gray-500 text-sm">
                  Search for products, brands and more
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;
