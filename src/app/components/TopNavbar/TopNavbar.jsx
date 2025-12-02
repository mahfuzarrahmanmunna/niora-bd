// components/TopNavbar/TopNavbar.js
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const TopNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchContainerRef = useRef(null);
    const categoryDropdownRef = useRef(null);
    const debounceTimerRef = useRef(null);

    // Fetch all products when component mounts
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/data.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setAllProducts(data);

                // Extract unique categories
                const uniqueCategories = [...new Set(data.map(product => product.category))];
                setCategories(uniqueCategories);

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching products for search:', error);
                setIsLoading(false);
            }
        };
        fetchProducts();

        // Set search query from URL on component mount
        const query = searchParams.get('q');
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

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Close mobile menu when changing routes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debounced filter function
    const debouncedFilterProducts = useCallback((query) => {
        if (query.trim() === '') {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        // Filter products based on search query
        const filteredProducts = allProducts.filter(product => {
            const searchTerm = query.toLowerCase();
            const name = product.name.toLowerCase();
            const brand = product.brand.toLowerCase();
            const category = product.category.toLowerCase();

            // Exact match
            if (name.includes(searchTerm) || brand.includes(searchTerm) || category.includes(searchTerm)) {
                return true;
            }

            // Partial match with tolerance for typos
            const nameWords = name.split(' ');
            const brandWords = brand.split(' ');
            const categoryWords = category.split(' ');

            return nameWords.some(word => word.includes(searchTerm)) ||
                brandWords.some(word => word.includes(searchTerm)) ||
                categoryWords.some(word => word.includes(searchTerm));
        });

        setSearchResults(filteredProducts.slice(0, 5)); // Limit to 5 results in dropdown
        setShowSuggestions(true);
    }, [allProducts]);

    // Handle search input change with debouncing
    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear the existing timer
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

    // Function to render star rating
    const renderRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <svg key={`full-${i}`} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                ))}
                {hasHalfStar && (
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <svg key={`empty-${i}`} className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                ))}
            </div>
        );
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/all-products', label: 'All Products' },
        { href: '/deals', label: 'Deals' },
        { href: '/about-us', label: 'About' },
    ];

    // Popular categories to show first
    const popularCategories = ['Makeup', 'Skincare', 'Hair Care', 'Fragrance'];
    const sortedCategories = [
        ...popularCategories.filter(cat => categories.includes(cat)),
        ...categories.filter(cat => !popularCategories.includes(cat))
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
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
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === link.href
                                    ? 'text-indigo-600 bg-indigo-50'
                                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Categories Dropdown */}
                        <div className="relative" ref={categoryDropdownRef}>
                            <button
                                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center ${pathname.startsWith('/category')
                                        ? 'text-indigo-600 bg-indigo-50'
                                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                    }`}
                            >
                                Categories
                                <svg
                                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
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
                                                        {allProducts.filter(p => p.category === category).length} items
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
                                    <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        {isLoading ? (
                                            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Search Results Dropdown */}
                            {showSuggestions && searchResults.length > 0 && (
                                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                    <ul className="py-1">
                                        {searchResults.map((product) => (
                                            <li key={product.id}>
                                                <Link
                                                    href={`/product/${product.id}`}
                                                    className="block px-4 py-3 hover:bg-gray-100 flex items-center"
                                                    onClick={handleSuggestionClick}
                                                >
                                                    <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                                                        <Image
                                                            src={`https://picsum.photos/seed/${product.id}/100/100.jpg`}
                                                            alt={product.name}
                                                            fill
                                                            sizes="48px"
                                                            className="object-cover rounded"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                        <p className="text-xs text-gray-500">{product.brand}</p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="flex items-center">
                                                                {renderRating(product.rating)}
                                                                <span className="ml-1 text-xs text-gray-600">({product.rating})</span>
                                                            </div>
                                                            <div>
                                                                {product.discount > 0 ? (
                                                                    <>
                                                                        <span className="text-sm font-bold text-gray-900">${product.finalPrice.toFixed(2)}</span>
                                                                        <span className="text-xs text-gray-500 line-through ml-1">${product.price.toFixed(2)}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
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
                                            View all results for "{searchQuery}"
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* No Results Message */}
                            {showSuggestions && searchQuery && searchResults.length === 0 && !isLoading && (
                                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <div className="px-4 py-6 text-center">
                                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <p className="text-gray-500">No products found for "{searchQuery}"</p>
                                        <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Icon (Mobile) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200"
                        >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* User Profile Icon */}
                        <button className="p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>

                        {/* Shopping Cart Icon */}
                        <button className="p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 relative transition-all duration-200">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                                3
                            </span>
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu panel with search */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="px-4 pt-4 pb-3 space-y-3 bg-white border-t border-gray-200">
                    {/* Mobile Search Bar */}
                    <div className="relative" ref={searchContainerRef}>
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Search products..."
                                    className="w-full px-4 py-2 pr-10 text-sm text-gray-700 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200"
                                    autoFocus
                                />
                                <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    {isLoading ? (
                                        <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Mobile Search Results Dropdown */}
                        {showSuggestions && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                <ul className="py-1">
                                    {searchResults.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                href={`/product/${product.id}`}
                                                className="block px-4 py-3 hover:bg-gray-100 flex items-center"
                                                onClick={handleSuggestionClick}
                                            >
                                                <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                                                    <Image
                                                        src={`https://picsum.photos/seed/${product.id}/100/100.jpg`}
                                                        alt={product.name}
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover rounded"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                    <p className="text-xs text-gray-500">{product.brand}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center">
                                                            {renderRating(product.rating)}
                                                            <span className="ml-1 text-xs text-gray-600">({product.rating})</span>
                                                        </div>
                                                        <div>
                                                            {product.discount > 0 ? (
                                                                <>
                                                                    <span className="text-sm font-bold text-gray-900">${product.finalPrice.toFixed(2)}</span>
                                                                    <span className="text-xs text-gray-500 line-through ml-1">${product.price.toFixed(2)}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
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
                                        View all results for "{searchQuery}"
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mobile No Results Message */}
                        {showSuggestions && searchQuery && searchResults.length === 0 && !isLoading && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="px-4 py-6 text-center">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <p className="text-gray-500">No products found for "{searchQuery}"</p>
                                    <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${pathname === link.href
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Mobile Categories Section */}
                    <div className="pt-2 border-t border-gray-100">
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</h3>
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
                                            {allProducts.filter(p => p.category === category).length}
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
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;