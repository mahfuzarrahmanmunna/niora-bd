// components/SearchBar/SearchBar.js
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchContainerRef = useRef(null);
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

    // Debounced filter function
    const debouncedFilterProducts = useCallback((query) => {
        if (query.trim() === '') {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        // Filter products based on search query (with some tolerance for typos)
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
            // Check if any word in product name contains search query
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = () => {
        // Close dropdown when a suggestion is clicked
        setShowSuggestions(false);
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const handleLinkClick = () => {
        setIsDrawerOpen(false);
    };

    // Function to render star rating
    const renderRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        return (
            <div className="flex items-center bg-pink-500 mt-5">
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

    return (
        <>
            <div className="sticky top-0 z-40 bg-gray-600/20 border-b shadow border-gray-200 px-4 py-3">
                <div className="relative" ref={searchContainerRef}>
                    <form onSubmit={handleSearch}>
                        <div className="flex items-center">
                            {/* Hamburger menu button */}
                            <button
                                type="button"
                                onClick={toggleDrawer}
                                className=" pr-2 rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-gray-600"
                                    viewBox="0 0 283.426 283.426"
                                    fill="currentColor"
                                >
                                    <rect x="0" y="40.84" width="283.426" height="47.735" />
                                    <rect x="0" y="117.282" width="283.426" height="47.735" />
                                    <rect x="0" y="194.851" width="283.426" height="47.735" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Search products..."
                                className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100/90 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                )}
                            </div>


                        </div>
                    </form>

                    {/* Search Results Dropdown */}
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
                                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View all results for `{searchQuery}`
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No Results Message */}
                    {showSuggestions && searchQuery && searchResults.length === 0 && !isLoading && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="px-4 py-6 text-center">
                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="text-gray-500">No products found for `{searchQuery}`</p>
                                <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer/Navbar */}
            <div
                className={`fixed inset-0 z-50 overflow-hidden ${isDrawerOpen ? 'block' : 'hidden'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={toggleDrawer}
                ></div>

                {/* Drawer panel */}
                <div
                    className={`absolute top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">Menu</h2>
                        <button
                            onClick={toggleDrawer}
                            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation items */}
                    <nav className="p-4">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/all-products"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/deals"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Deals
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/account"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cart"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Shopping Cart
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/help-and-support"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Help & Support
                                </Link>
                            </li>
                            <li>
                                {/* <Link
                                    href="/settings"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Settings
                                </Link> */}
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default SearchBar;