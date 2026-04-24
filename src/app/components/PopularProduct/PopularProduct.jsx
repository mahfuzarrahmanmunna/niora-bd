"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query"; // Import useQuery

const PopularProduct = () => {
  // --- TANSTACK QUERY FETCH ---
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["popularProducts"],
    queryFn: async () => {
      // Fetch from your new API, limiting to 12 items
      const response = await fetch("/api/popularproduct?limit=12");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
    staleTime: Infinity, // Data stays fresh forever (No reload needed)
    retry: 1,
  });

  // Extract products from the API response structure
  const products = apiResponse?.data || [];

  // New state to control how many items are currently visible (Staggered effect)
  const [visibleCount, setVisibleCount] = useState(0);

  // --- STAGGERED REVEAL EFFECT ---
  useEffect(() => {
    // Only start staggering if products are loaded and we haven't shown all of them yet
    if (products.length > 0 && visibleCount < products.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1); // Reveal one more product
      }, 100); // 100ms delay between each product appearing

      return () => clearTimeout(timer);
    }
  }, [products, visibleCount]);

  // --- IMAGE LOGIC ---
  const getDisplayImage = (product) => {
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }
    if (
      product.imageUrls &&
      Array.isArray(product.imageUrls) &&
      product.imageUrls.length > 0
    ) {
      return product.imageUrls[0];
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return `https://picsum.photos/seed/${product.id}/400/400.jpg`;
  };

  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        <span className="ml-1 text-xs text-gray-600">({rating || 0})</span>
      </div>
    );
  };

  // Initial Skeleton State (While Query is loading)
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-100 overflow-hidden"
            >
              <div className="w-full aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">
          Error loading products: {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Helper for Skeleton Card (used for the "waiting" products in the staggered effect)
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="w-full aspect-square bg-gray-100 animate-pulse"></div>
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
        <Link
          href="/all-products"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
        >
          View All
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* We loop through the total number of products */}
        {products.map((product, index) => {
          // If the current index is less than visibleCount, show the Product
          if (index < visibleCount) {
            return (
              <div
                key={product._id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col animate-fade-in-up"
              >
                <Link
                  href={`/product/${product._id}`}
                  className="block h-full flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={getDisplayImage(product)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized={getDisplayImage(product).includes("ibb.co")}
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide truncate">
                      {product.brand || "Generic"}
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-5 flex-1">
                      {product.name}
                    </h3>

                    <div className="mb-3">{renderRating(product.rating)}</div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-lg font-bold text-gray-900 leading-none">
                              ৳
                              {typeof product.finalPrice === "string"
                                ? parseFloat(product.finalPrice).toFixed(2)
                                : product.finalPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400 line-through mt-1">
                              ৳
                              {typeof product.price === "string"
                                ? parseFloat(product.price).toFixed(2)
                                : product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900 leading-none">
                            ৳
                            {typeof product.finalPrice === "string"
                              ? parseFloat(product.finalPrice).toFixed(2)
                              : product.finalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log(`Added ${product.name} to cart`);
                          // Add to cart logic here
                        }}
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          }
          // Otherwise, show a Skeleton placeholder while waiting for this specific product to be revealed
          else {
            return <SkeletonCard key={`skeleton-${product._id}`} />;
          }
        })}
      </div>
    </div>
  );
};

export default PopularProduct;
