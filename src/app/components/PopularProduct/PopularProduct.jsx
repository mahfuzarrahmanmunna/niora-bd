// src/app/components/PopularProduct/PopularProduct.jsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

const PopularProduct = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Sort by rating and take top 8
          const sortedProducts = [...data.data]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8);
          setProducts(sortedProducts);
        } else {
          throw new Error("Invalid data format received");
        }
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- FIXED IMAGE LOGIC ---
  // 1. Check 'images' array (Correct key based on your JSON)
  // 2. Check 'imageUrls' array (Legacy fallback)
  // 3. Check singular 'imageUrl'
  // 4. Fallback to placeholder
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
        <p className="text-red-500 mb-4">Error loading products: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

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
        {products.map((product) => (
          <div
            key={product._id} // Unique key for React
            className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
          >
            <Link
              href={`/product/${product._id || product._id}`}
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
                  // Add unoptimized if your images are from external domains without proper config
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
        ))}
      </div>
    </div>
  );
};

export default PopularProduct;
