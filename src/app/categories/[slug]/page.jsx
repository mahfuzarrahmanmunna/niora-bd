// src/app/category/[slug]/page.jsx
"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const CategoryPage = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('default');
    const [filterPrice, setFilterPrice] = useState({ min: 0, max: 1000 });
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categorySlug, setCategorySlug] = useState('');
    const params = useParams();

    // Convert URL slug back to category name
    const getCategoryName = (slug) => {
        if (!slug) return '';
        return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Set category slug when params are available
    useEffect(() => {
        if (params.slug) {
            setCategorySlug(params.slug);
        }
    }, [params]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
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

    // Filter products by category
    useEffect(() => {
        if (products.length > 0 && categorySlug) {
            const categoryName = getCategoryName(categorySlug);
            const categoryProducts = products.filter(product =>
                product.category.toLowerCase() === categoryName.toLowerCase()
            );
            setFilteredProducts(categoryProducts);
        }
    }, [products, categorySlug]);

    // Sort products
    useEffect(() => {
        const sorted = [...filteredProducts];

        switch (sortBy) {
            case 'price-low':
                sorted.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
                break;
            case 'price-high':
                sorted.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price));
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep original order
                break;
        }

        setFilteredProducts(sorted);
    }, [sortBy]);

    // Filter by price
    useEffect(() => {
        if (products.length > 0 && categorySlug) {
            const categoryName = getCategoryName(categorySlug);
            const filtered = products.filter(product =>
                product.category.toLowerCase() === categoryName.toLowerCase() &&
                (product.finalPrice || product.price) >= filterPrice.min &&
                (product.finalPrice || product.price) <= filterPrice.max
            );

            // Apply current sort
            switch (sortBy) {
                case 'price-low':
                    filtered.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
                    break;
                case 'price-high':
                    filtered.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || b.price));
                    break;
                case 'rating':
                    filtered.sort((a, b) => b.rating - a.rating);
                    break;
                case 'name':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                default:
                    // Keep original order
                    break;
            }

            setFilteredProducts(filtered);
        }
    }, [filterPrice, products, categorySlug, sortBy]);

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
        e.stopPropagation();
        // Add to cart functionality here
        console.log(`Added ${product.name} to cart`);
        // You could show a notification here
    };

    if (isLoading || !categorySlug) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
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

    const categoryName = getCategoryName(categorySlug);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6 hidden sm:block">
                <Link href="/" className="hover:text-gray-700">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/all-products" className="hover:text-gray-700">Products</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{categoryName}</span>
            </nav>

            {/* Category Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
                <p className="text-gray-600">Discover our range of {categoryName.toLowerCase()} products</p>
            </div>

            {/* Filters and Sorting */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Price Filter */}
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Price:</span>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder="Min"
                                min="0"
                                value={filterPrice.min}
                                onChange={(e) => setFilterPrice(prev => ({ ...prev, min: Number(e.target.value) }))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                min="0"
                                value={filterPrice.max}
                                onChange={(e) => setFilterPrice(prev => ({ ...prev, max: Number(e.target.value) }))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="default">Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Rating</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Count */}
            <div className="mb-4 text-sm text-gray-600">
                Showing {filteredProducts.length} products
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
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

                                <div className="p-3 sm:p-4">
                                    <p className="text-xs text-gray-500 mb-1 truncate">{product.brand}</p>
                                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm mt-2">Try adjusting your filters or browse other categories</p>
                    </div>
                    <Link href="/all-products" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        Browse All Products
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;