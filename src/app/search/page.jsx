// app/search/page.jsx
'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Wrap the component in Suspense to fix the useSearchParams warning
function SearchResultsWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
}

function SearchResults() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('relevance');
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/data.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Calculate relevance score for sorting
    const calculateRelevanceScore = (product, query) => {
        const searchTerm = query.toLowerCase();
        const name = product.name.toLowerCase();
        const brand = product.brand.toLowerCase();
        const category = product.category.toLowerCase();
        const description = product.description.toLowerCase();

        const score = 0;

        // Exact match in name gets highest score
        if (name === searchTerm) score += 100;
        // Name starts with search term
        else if (name.startsWith(searchTerm)) score += 80;
        // Name contains search term
        else if (name.includes(searchTerm)) score += 60;

        // Brand match
        if (brand === searchTerm) score += 50;
        else if (brand.startsWith(searchTerm)) score += 40;
        else if (brand.includes(searchTerm)) score += 30;

        // Category match
        if (category === searchTerm) score += 30;
        else if (category.startsWith(searchTerm)) score += 20;
        else if (category.includes(searchTerm)) score += 10;

        // Description match
        if (description.includes(searchTerm)) score += 5;

        return score;
    };

    // Memoize the expensive filtering and sorting operation
    const sortedProducts = useMemo(() => {
        if (products.length === 0) return [];

        // Filter products based on search query
        const filtered = products.filter(product => {
            const searchTerm = query.toLowerCase();
            const name = product.name.toLowerCase();
            const brand = product.brand.toLowerCase();
            const category = product.category.toLowerCase();
            const description = product.description.toLowerCase();

            // Check if search term matches any product field
            return name.includes(searchTerm) ||
                brand.includes(searchTerm) ||
                category.includes(searchTerm) ||
                description.includes(searchTerm);
        });

        // Sort the filtered products
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.finalPrice - b.finalPrice;
                case 'price-high':
                    return b.finalPrice - a.finalPrice;
                case 'rating':
                    return b.rating - a.rating;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    // Default to relevance (how well the product matches the query)
                    const aScore = calculateRelevanceScore(a, query);
                    const bScore = calculateRelevanceScore(b, query);
                    return bScore - aScore;
            }
        });
    }, [products, query, sortBy]);

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

    // Handle add to cart
    const handleAddToCart = (e, product) => {
        e.preventDefault();
        console.log(`Added ${product.name} to cart`);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i}>
                                <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-8">
                    <p className="text-red-500">Error loading search results: {error}</p>
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
        <div className="container mx-auto px-4 py-8">
            {/* Search Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Search Results for "{query}"
                </h1>
                <p className="text-gray-600">
                    {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
                </p>
            </div>

            {/* Sort Options */}
            {sortedProducts.length > 0 && (
                <div className="mb-6 flex justify-end">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Rating</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {sortedProducts.map((product) => (
                        <Link href={`/product/${product.id}`} key={product.id} className="group">
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                                <div className="relative">
                                    <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
                                        <Image
                                            src={`https://picsum.photos/seed/${product.id}/400/400.jpg`}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    {product.discount > 0 && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                            -{product.discount}%
                                        </div>
                                    )}
                                </div>

                                <div className="p-3">
                                    <p className="text-xs text-gray-500 mb-1 truncate">{product.brand}</p>
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
                                            className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none transition-colors"
                                            onClick={(e) => handleAddToCart(e, product)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm mt-2">Try searching with different keywords</p>
                    </div>
                    <Link href="/products" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        Browse All Products
                    </Link>
                </div>
            )}
        </div>
    );
}

export default SearchResultsWrapper;