// app/products/page.jsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const AllProducts = () => {
    const [products, setProducts] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [displayedCategories, setDisplayedCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [categoriesLoaded, setCategoriesLoaded] = useState(0);
    const [error, setError] = useState(null);
    const observer = useRef();
    const router = useRouter(); // Initialize router
    const categoriesPerLoad = 2; // Number of categories to load at a time

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                
                // Fetch data from API
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                
                // Handle nested data structure
                let allProducts = [];
                
                if (data.success && Array.isArray(data.data)) {
                    // Use data.data directly if it's already an array of products
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

                // Display first batch of categories
                const categoryNames = Object.keys(grouped);
                const initialCategories = categoryNames.slice(0, categoriesPerLoad);
                setDisplayedCategories(initialCategories);
                setCategoriesLoaded(categoriesPerLoad);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Function to render star rating
    const renderRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                ))}
                {hasHalfStar && (
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                ))}
                <span className="ml-1 text-xs text-gray-600">({rating})</span>
            </div>
        );
    };

    // Load more categories when user scrolls to bottom
    const loadMoreCategories = useCallback(() => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);

        // Simulate loading delay
        setTimeout(() => {
            const allCategories = Object.keys(productsByCategory);
            const nextCategories = allCategories.slice(
                categoriesLoaded,
                categoriesLoaded + categoriesPerLoad
            );

            if (nextCategories.length === 0) {
                setHasMore(false);
            } else {
                setDisplayedCategories(prev => [...prev, ...nextCategories]);
                setCategoriesLoaded(prev => prev + nextCategories.length);
            }

            setLoadingMore(false);
        }, 500);
    }, [categoriesLoaded, loadingMore, hasMore, productsByCategory]);

    // Setup intersection observer for infinite scroll
    const lastCategoryRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreCategories();
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore, loadMoreCategories]);

    // Handle product click (navigate to product details page)
    const handleProductClick = (product) => {
        // Navigate to product details page
        router.push(`/product/${product.id}`);
    };

    // Handle add to cart
    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        // Add to cart functionality here
        console.log(`Added ${product.name} to cart`);
        // You can update cart state or show a notification here
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6 text-center md:text-2xl">All Products</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-8">
                    <p className="text-red-500">Error loading products: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-bold mb-6 text-center md:text-2xl">All Products</h2>

            {displayedCategories.map((category, categoryIndex) => (
                <div
                    key={category}
                    ref={categoryIndex === displayedCategories.length - 1 ? lastCategoryRef : null}
                    className="mb-12"
                >
                    <h3 className="text-lg font-semibold mb-4 capitalize text-gray-800">{category}</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {productsByCategory[category].map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer"
                                onClick={() => handleProductClick(product)}
                            >
                                <div className="relative">
                                    <div className="w-full h-40 md:h-48 bg-gray-100 relative overflow-hidden">
                                        {/* Using Next.js Image component */}
                                        <Image
                                            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400.jpg`}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                            className="object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    {product.discount > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                            -{product.discount}%
                                        </div>
                                    )}
                                </div>

                                <div className="p-3">
                                    <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>

                                    <div className="flex items-center mb-2">
                                        {renderRating(product.rating)}
                                    </div>

                                    <div className="flex items-center justify-between">
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
                                        <button
                                            className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none transition-colors"
                                            onClick={(e) => handleAddToCart(e, product)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Loading indicator for more categories */}
            {loadingMore && (
                <div className="flex justify-center mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* End of products message */}
            {!hasMore && (
                <div className="text-center mt-8 text-gray-500">
                    <p>You have reached the end of our product list</p>
                </div>
            )}
        </div>
    );
};

export default AllProducts;