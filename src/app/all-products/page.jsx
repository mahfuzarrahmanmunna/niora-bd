"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { fbq } from "@/lib/fpixel";

// --- Sub-component: Product Card ---
const ProductCard = ({ product, onAddToCart, index }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // --- FIXED IMAGE LOGIC ---
  // 1. Check 'images' array (Based on your JSON data structure)
  // 2. Check 'imageUrls' array (Fallback for other data structures)
  // 3. Check singular 'imageUrl'
  // 4. Fall back to placeholder
  const getDisplayImage = () => {
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

  const imageSrc = getDisplayImage();

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    fbq("track", "AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "BDT",
    });
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
        <span className="ml-1 text-xs text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <Link href={`/product/${product._id}`} className="group block h-full">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100">
        {/* Image Container with Skeleton Loading */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
          )}

          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover group-hover:scale-105 transition-transform duration-500 relative z-10 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
            priority={index === 0}
          />

          {product.discount > 0 && (
            <div className="absolute top-2 right-2 z-20 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
              -{product.discount}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide truncate">
            {product.brand || "Generic"}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] leading-5">
            {product.name}
          </h3>

          <div className="mb-3">{renderRating(product.rating || 0)}</div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              {product.discount > 0 ? (
                <>
                  <span className="text-lg font-bold text-gray-900 leading-none">
                    ৳{parseFloat(product.finalPrice).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 line-through mt-1">
                    ৳{parseFloat(product.price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900 leading-none">
                  ৳{parseFloat(product.price || product.finalPrice).toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCartClick}
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- Main Page Component ---
const AllProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter State
  const [sortBy, setSortBy] = useState("default");
  const [filterPrice, setFilterPrice] = useState({ min: 0, max: 1000000 });
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fbq("track", "ViewContent", {
      content_name: products.name,
      content_category: products.category,
      value: products.price,
      currency: "BDT",
    });
  }, [products]);
  console.log(products);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Adding page parameter to the API call
        const response = await fetch(
          `/api/products?page=${currentPage}&limit=10`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();

        setProducts(data.data || []);

        // Set pagination info from response
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1);
          setTotalItems(data.pagination.total || 0);
        }

        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]); // Refetch when currentPage changes

  // Reset to page 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const uniqueCategories = useMemo(() => {
    if (!products.length) return [];
    return ["all", ...new Set(products.map((p) => p.category))];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    let result = [...products];

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.brand &&
            product.brand.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    if (filterCategory !== "all") {
      result = result.filter((product) => product.category === filterCategory);
    }

    result = result.filter((product) => {
      const price = parseFloat(product.finalPrice || product.price);
      return price >= filterPrice.min && price <= filterPrice.max;
    });

    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) =>
            parseFloat(a.finalPrice || a.price) -
            parseFloat(b.finalPrice || b.price),
        );
        break;
      case "price-high":
        result.sort(
          (a, b) =>
            parseFloat(b.finalPrice || b.price) -
            parseFloat(a.finalPrice || a.price),
        );
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Sort by MongoDB ID as a proxy for creation time if no default sort provided
        result.sort((a, b) => a._id.localeCompare(b._id));
        break;
    }

    return result;
  }, [products, sortBy, filterPrice, filterCategory, searchTerm]);

  const handleAddToCart = (product) => {
    console.log(`Added ${product.name} to cart`);
    alert("Added to cart!"); // Simple feedback
  };

  // --- Page Level Skeleton Loader ---
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 h-24 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="w-full aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-3">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600 font-medium mb-4">
            Error loading products: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 hidden sm:block">
        <Link href="/" className="hover:text-gray-900 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-gray-900 font-medium">All Products</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">
          Discover our complete range of beauty and skincare products
        </p>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8  z-30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) =>
                handleFilterChange(setSearchTerm, e.target.value)
              }
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) =>
                handleFilterChange(setFilterCategory, e.target.value)
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={filterPrice.min}
              onChange={(e) =>
                setFilterPrice((prev) => ({
                  ...prev,
                  min: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={filterPrice.max}
              onChange={(e) =>
                setFilterPrice((prev) => ({
                  ...prev,
                  max: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort Options */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Count */}
      <div className="mb-6 text-sm font-medium text-gray-600 flex justify-between items-center">
        <span>
          Showing {filteredAndSortedProducts.length} of {totalItems} total
          products
        </span>
        {(searchTerm || filterCategory !== "all" || sortBy !== "default") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterCategory("all");
              setFilterPrice({ min: 0, max: 10000000 });
              setSortBy("default");
              setCurrentPage(1);
            }}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredAndSortedProducts.map((product, index) => (
              <ProductCard
                key={product._id || product.id} // FIXED: Use _id for uniqueness
                product={product}
                onAddToCart={handleAddToCart}
                index={index}
              />
            ))}
          </div>

          {/* --- Pagination Controls --- */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="text-sm text-gray-500">
              Page{" "}
              <span className="font-medium text-gray-900">{currentPage}</span>{" "}
              of <span className="font-medium text-gray-900">{totalPages}</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } transition-colors`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } transition-colors`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No products found
          </h3>
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            We could not find any matches for your search. Try adjusting your
            filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterCategory("all");
              setFilterPrice({ min: 0, max: 1000000 });
              setSortBy("default");
              setCurrentPage(1);
            }}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProductsPage;
