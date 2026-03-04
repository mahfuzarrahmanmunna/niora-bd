"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const SearchBar = ({ placeholder = "Search products...", className = "" }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef(null);

  // Fetch all products once when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching products for search:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setFilteredProducts([]);
      setShowSuggestions(false);
      return;
    }

    // Filter products locally based on Name, Brand, or Category
    const searchTerm = value.toLowerCase();
    const filtered = products.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const brand = (product.brand || "").toLowerCase();
      const category = (product.category || "").toLowerCase();

      return (
        name.includes(searchTerm) ||
        brand.includes(searchTerm) ||
        category.includes(searchTerm)
      );
    });

    setFilteredProducts(filtered.slice(0, 5)); // Show max 5 suggestions
    setShowSuggestions(true);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Helper to format price
  const formatPrice = (price) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className={`relative w-full ${className}`} ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 text-sm text-gray-700 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-indigo-500 transition-all duration-200"
        />
        <button
          type="submit"
          className="absolute inset-y-0 left-0 flex items-center pl-3"
        >
          {isLoading ? (
            <FaSpinner className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <FaSearch className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilteredProducts([]);
              setShowSuggestions(false);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            <ul className="py-1">
              {filteredProducts.map((product) => (
                <li key={product._id}>
                  <Link
                    href={`/product/${product._id}`}
                    className="block px-4 py-3 hover:bg-gray-50 flex items-center transition-colors"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <div className="relative w-10 h-10 mr-3 flex-shrink-0 bg-gray-100 rounded">
                      <Image
                        src={
                          product.imageUrls && product.imageUrls.length > 0
                            ? product.imageUrls[0]
                            : `https://picsum.photos/seed/${product._id}/100/100.jpg`
                        }
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{product.brand}</p>
                        <p className="text-sm font-bold text-indigo-600">
                          ${formatPrice(product.finalPrice || product.price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              <li className="border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  className="w-full text-center px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium"
                >
                  View all results for `{query}`
                </button>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-gray-500 text-sm">No products found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
