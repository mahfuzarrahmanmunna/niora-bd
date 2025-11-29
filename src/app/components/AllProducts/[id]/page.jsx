// src/app/product/[id]/ProductDetails.jsx
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ProductDetails = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    // Create an array of images for the gallery
    // Using placeholder images with different seeds for variety
    const productImages = [
        `https://picsum.photos/seed/${product.id}-main/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt1/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt2/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt3/800/800.jpg`,
    ];

    const handleAddToCart = () => {
        setIsAddingToCart(true);
        // Simulate API call
        setTimeout(() => {
            console.log(`Added ${quantity} x ${product.name} to cart.`);
            setIsAddingToCart(false);
            // You could show a success notification here
        }, 1500);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <svg
                key={i}
                className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
        ));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-gray-700">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/products" className="hover:text-gray-700">Products</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                        <Image
                            src={productImages[selectedImage]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                        {product.discount > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                -{product.discount}%
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-2 overflow-x-auto">
                        {productImages.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative overflow-hidden rounded-lg border-2 flex-shrink-0 w-20 h-20 ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'}`}
                            >
                                <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Information */}
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">{product.brand}</p>
                        <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            {renderStars(product.rating)}
                        </div>
                        <span className="text-gray-600 text-sm">({product.rating} out of 5)</span>
                    </div>

                    <div className="flex items-baseline space-x-3">
                        {product.discount > 0 ? (
                            <>
                                <span className="text-3xl font-bold text-gray-900">${product.finalPrice.toFixed(2)}</span>
                                <span className="text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        )}
                    </div>

                    <p className="text-gray-700">{product.description}</p>

                    <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
                        </span>
                    </div>

                    {/* Add to Cart Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity:</label>
                            <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || isAddingToCart}
                            className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isAddingToCart ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </>
                            ) : (
                                'Add to Cart'
                            )}
                        </button>
                    </div>

                    {/* Product Features */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {product.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Information Tabs */}
            <div className="mt-12 border-t pt-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {['description', 'specifications', 'ingredients', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-6">
                    {activeTab === 'description' && (
                        <div className="prose max-w-none">
                            <p>{product.description}</p>
                            <p className="mt-4">This product is perfect for those looking for high-quality {product.category.toLowerCase()} that delivers exceptional results. Made with carefully selected ingredients, it provides a luxurious experience while being gentle on your skin.</p>
                        </div>
                    )}
                    {activeTab === 'specifications' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><span className="font-semibold">Brand:</span> {product.brand}</div>
                            <div><span className="font-semibold">Category:</span> {product.category}</div>
                            <div><span className="font-semibold">Shade:</span> {product.shade}</div>
                            <div><span className="font-semibold">Volume:</span> {product.volume}</div>
                            <div><span className="font-semibold">Skin Type:</span> {product.skinType}</div>
                            <div><span className="font-semibold">Expiration Date:</span> {product.expirationDate}</div>
                        </div>
                    )}
                    {activeTab === 'ingredients' && (
                        <div>
                            <p className="font-semibold mb-2">Full Ingredient List:</p>
                            <p className="text-gray-700">{product.ingredients.join(', ')}</p>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div>
                            <p className="text-gray-500">Customer reviews will be displayed here.</p>
                            <p className="mt-2">Average Rating: {product.rating} / 5.0</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;