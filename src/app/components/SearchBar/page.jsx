// components/SearchBar/SearchBar.js
'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to search results page with query parameter
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const handleLinkClick = () => {
        // Close the drawer when a link is clicked
        setIsDrawerOpen(false);
    };

    return (
        <>
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
                <form onSubmit={handleSearch} className="relative">
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
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
                        </div>

                        {/* Hamburger menu button */}
                        <button
                            type="button"
                            onClick={toggleDrawer}
                            className="ml-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
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
                    </div>
                </form>
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
                                    href="/products"
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
                                    href="/help"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Help & Support
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/settings"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                    onClick={handleLinkClick}
                                >
                                    Settings
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default SearchBar;