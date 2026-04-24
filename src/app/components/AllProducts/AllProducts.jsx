"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const AllProducts = () => {
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [visibleProductIds, setVisibleProductIds] = useState(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();
  const categoriesPerLoad = 2;

  // --- TANSTACK QUERY FETCH ---
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["productsByCategory"],
    queryFn: async () => {
      const response = await fetch("/api/productbycategory");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
    staleTime: Infinity, // Data stays fresh forever. Navigating back won't reload.
    retry: 1,
  });

  // --- INITIAL BATCH SETUP ---
  // We wait for data to arrive, then set the initial batch of categories
  useEffect(() => {
    if (apiResponse?.success && apiResponse?.data) {
      const allGroups = apiResponse.data;
      setDisplayedCategories(allGroups.slice(0, categoriesPerLoad));
    }
  }, [apiResponse]);

  // --- STAGGERED REVEAL EFFECT ---
  useEffect(() => {
    if (!apiResponse?.data) return;

    // Find all product IDs currently in the DOM
    const allIdsOnScreen = [];
    displayedCategories.forEach((group) => {
      const prods = group.products || [];
      prods.forEach((p) => {
        allIdsOnScreen.push(p.id || p._id);
      });
    });

    // Find the next one to reveal
    const nextIdToReveal = allIdsOnScreen.find(
      (id) => !visibleProductIds.has(id),
    );

    if (nextIdToReveal) {
      const timer = setTimeout(() => {
        setVisibleProductIds((prev) => new Set(prev).add(nextIdToReveal));
      }, 150); // Delay in ms
      return () => clearTimeout(timer);
    }
  }, [displayedCategories, visibleProductIds, apiResponse]);

  // --- IMAGE LOGIC ---
  const getDisplayImage = (product) => {
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }
    // Fallback for imageUrls if needed, based on your provided JSON
    if (
      product.imageUrls &&
      Array.isArray(product.imageUrls) &&
      product.imageUrls.length > 0
    ) {
      return product.imageUrls[0];
    }
    return `https://picsum.photos/seed/${product.id}/400/400.jpg`;
  };

  // --- RATING RENDERER ---
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

  // --- LOAD MORE LOGIC ---
  const loadMoreCategories = useCallback(() => {
    if (loadingMore || !apiResponse?.data) return;

    setLoadingMore(true);

    // Minimal delay to allow UI to update
    setTimeout(() => {
      const allGroups = apiResponse.data;
      const currentCount = displayedCategories.length;

      const nextCategories = allGroups.slice(
        currentCount,
        currentCount + categoriesPerLoad,
      );

      if (nextCategories.length > 0) {
        setDisplayedCategories((prev) => [...prev, ...nextCategories]);
      }

      setLoadingMore(false);
    }, 300);
  }, [loadingMore, apiResponse, displayedCategories]);

  // --- INTERSECTION OBSERVER ---
  const lastCategoryRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        // Check if there are more items to load in the API response
        const hasMoreItems =
          displayedCategories.length < (apiResponse?.data?.length || 0);

        if (entries[0].isIntersecting && hasMoreItems) {
          loadMoreCategories();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, loadMoreCategories, displayedCategories.length, apiResponse],
  );

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Added ${product.name} to cart`);
    // Facebook pixel tracking (if available)
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "AddToCart", {
        content_name: product.name,
        content_ids: [product.id],
        content_type: "product",
        value: product.price,
        currency: "BDT",
      });
    }
  };

  // --- SKELETON CARD ---
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

  // --- INITIAL LOADING STATE ---
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-8 animate-pulse mx-auto"></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Error loading products: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const allCategories = apiResponse?.data || [];
  const hasMoreItems = displayedCategories.length < allCategories.length;

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        All Products
      </h2>

      {displayedCategories.map((group, index) => {
        const isLast = index === displayedCategories.length - 1;

        return (
          <div
            key={group.category}
            ref={isLast ? lastCategoryRef : null}
            className="mb-12"
          >
            {/* --- UPDATED CATEGORY HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              {/* Left: Category Name */}
              <h3 className="text-xl font-bold text-gray-800 capitalize flex items-center">
                <span className="w-2 h-6 bg-blue-600 rounded mr-3"></span>
                {group.category}
              </h3>

              {/* Right: Redirect Button */}
              <Link
                href={`/products?category=${group.category}`}
                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors self-start sm:self-auto"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {group.products.map((product) => {
                const productId = product.id || product._id;
                const isVisible = visibleProductIds.has(productId);

                return isVisible ? (
                  <div
                    key={productId}
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
                          unoptimized={getDisplayImage(product).includes(
                            "ibb.co",
                          )}
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

                        <div className="mb-3">
                          {renderRating(product.rating)}
                        </div>

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
                            onClick={(e) => handleAddToCart(e, product)}
                            aria-label="Add to cart"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <SkeletonCard key={productId} />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Loading indicator for more categories */}
      {loadingMore && hasMoreItems && (
        <div className="flex justify-center mt-8 py-4">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="animate-spin h-6 w-6" />
            <span className="text-sm font-medium">
              Loading more categories...
            </span>
          </div>
        </div>
      )}

      {/* End of products message */}
      {!hasMoreItems && displayedCategories.length > 0 && (
        <div className="text-center mt-12 py-8 border-t border-gray-100 space-y-6">
          <Link href={"/all-products"} className="px-8 py-2 bg-blue-500 font-bold tracking-[-2%] leading-6 rounded hover:bg-white hover:text-blue-600 ">
            See All Product
          </Link>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
