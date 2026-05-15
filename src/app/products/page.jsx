"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Suspense } from "react";

// --- Manual Facebook Pixel Import REMOVED ---
// import { fbq } from "@/lib/fpixel";

// --- 2. Extracted Loading Component (Used for Suspense Fallback) ---
const ProductsSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse mx-auto"></div>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. Main Component Logic (Renamed to Content) ---
const AllProductsContent = () => {
  const [products, setProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categoriesLoaded, setCategoriesLoaded] = useState(0);
  const [error, setError] = useState(null);
  const observer = useRef();

  const router = useRouter();
  const searchParams = useSearchParams(); // Safe inside Suspense
  const categoryParam = searchParams.get("category");

  const categoriesPerLoad = 2;

  // --- UPDATED: ViewContent event pushed to Data Layer ---
  useEffect(() => {
    if (products.length > 0) {
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "view_item_list", // GTM Trigger Name
          item_list_name: "All Products",
          items: products.map((product) => ({
            item_id: product.id,
            item_name: product.name,
            category: product.category,
            price: product.finalPrice || product.price,
            currency: "BDT",
          })),
        });
      }
    }
  }, [products]);

  console.log(products);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();

        let allProducts = [];

        if (data.success && Array.isArray(data.data)) {
          allProducts = data.data;
        }

        setProducts(allProducts);

        // Group products by category
        const grouped = allProducts.reduce((acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = [];
          }
          acc[product.category].push(product);
          return acc;
        }, {});

        setProductsByCategory(grouped);

        // Display first batch of categories (only if not filtering)
        if (!categoryParam) {
          const categoryNames = Object.keys(grouped);
          const initialCategories = categoryNames.slice(0, categoriesPerLoad);
          setDisplayedCategories(initialCategories);
          setCategoriesLoaded(categoriesPerLoad);
        }

        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam]);

  // --- IMAGE LOGIC HELPER ---
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

  const loadMoreCategories = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    setTimeout(() => {
      const allCategories = Object.keys(productsByCategory);
      const nextCategories = allCategories.slice(
        categoriesLoaded,
        categoriesLoaded + categoriesPerLoad,
      );

      if (nextCategories.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedCategories((prev) => [...prev, ...nextCategories]);
        setCategoriesLoaded((prev) => prev + nextCategories.length);
      }

      setLoadingMore(false);
    }, 500);
  }, [categoriesLoaded, loadingMore, hasMore, productsByCategory]);

  const lastCategoryRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreCategories();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, loadMoreCategories],
  );

  // --- UPDATED: AddToCart event pushed to Data Layer ---
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Added ${product.name} to cart`);

    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "add_to_cart", // GTM Trigger Name
        ecommerce: {
          currency: "BDT",
          value: product.finalPrice || product.price,
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              price: product.finalPrice || product.price,
              quantity: 1,
            },
          ],
        },
      });
    }
  };

  if (isLoading) {
    return <ProductsSkeleton />;
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

  // ==========================================
  // VIEW: SPECIFIC CATEGORY FILTER
  // ==========================================
  if (categoryParam) {
    const filteredProducts = products.filter(
      (p) => p.category.toLowerCase() === categoryParam.toLowerCase(),
    );

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
              {categoryParam}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Showing {filteredProducts.length} products
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            View All Categories
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                <Link
                  href={`/product/${product._id}`}
                  className="block h-full flex flex-col"
                >
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
                        onClick={(e) => handleAddToCart(e, product)}
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
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: ALL PRODUCTS (GROUPED BY CATEGORY)
  // ==========================================
  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        All Products
      </h2>

      {displayedCategories.map((category, categoryIndex) => (
        <div
          key={category}
          ref={
            categoryIndex === displayedCategories.length - 1
              ? lastCategoryRef
              : null
          }
          className="mb-12"
        >
          <div className="flex items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 capitalize">
              {category}
            </h3>
            <div className="flex-1 h-px bg-gray-200 ml-4"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productsByCategory[category].map((product) => (
              <div
                key={product._id || product.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                <Link
                  href={`/product/${product._id}`}
                  className="block h-full flex flex-col"
                >
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
                        onClick={(e) => handleAddToCart(e, product)}
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
      ))}

      {loadingMore && (
        <div className="flex justify-center mt-8 py-4">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="animate-spin h-6 w-6" />
            <span className="text-sm font-medium">
              Loading more categories...
            </span>
          </div>
        </div>
      )}

      {!hasMore && (
        <div className="text-center mt-12 py-8 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            You have reached the end of our product list
          </p>
        </div>
      )}
    </div>
  );
};

// --- 4. Default Export with Suspense Wrapper ---
export default function AllProducts() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <AllProductsContent />
    </Suspense>
  );
}
