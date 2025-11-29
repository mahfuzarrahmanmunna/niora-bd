// src/app/components/PopularProduct/PopularProduct.jsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PopularProduct = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch data from the public folder
                const response = await fetch('/data.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                // Display only first 8 products for "popular" section
                setProducts(data.slice(0, 8));
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

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Popular Products</h2>
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-gray-800 font-bold md:text-2xl">Popular Products</h2>
                <Link href="/products" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                        <Link href={`/product/${product.id}`} className="block">
                            <div className="relative">
                                <div className="w-full h-40 md:h-48 bg-gray-100 relative overflow-hidden">
                                    {/* Using placeholder image since the provided URLs are examples */}
                                    <Image
                                        src={`https://picsum.photos/seed/${product.id}/400/400.jpg`}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        className="object-cover"
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
                                        className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // Add to cart functionality here
                                            console.log(`Added ${product.name} to cart`);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* <div className="text-center mt-8">
                <Link href="/products" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200">
                    View All Products
                </Link>
            </div> */}
        </div>
    );
};

export default PopularProduct;