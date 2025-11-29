// src/app/product/[id]/page.jsx
"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const ProductDetails = () => {
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const fileInputRef = useRef(null);
    const router = useRouter();
    const [reviewForm, setReviewForm] = useState({
        name: '',
        email: '',
        rating: 5,
        title: '',
        comment: '',
        profileImage: null, // To store the file object
        profileImagePreview: '/placeholder-avatar.png' // To store the preview URL
    });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const params = useParams();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch('/data.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                const data = await response.json();

                const foundProduct = data.find(p => p.id === params.id);

                if (!foundProduct) {
                    throw new Error('Product not found');
                }

                setProduct(foundProduct);

                // Get all products from the same category (excluding the current product)
                const related = data.filter(p =>
                    p.category === foundProduct.category && p.id !== foundProduct.id
                );

                setRelatedProducts(related);

                const mockReviews = [
                    {
                        id: 1,
                        name: "Sarah Johnson",
                        profileImage: "https://picsum.photos/seed/user1/100/100.jpg",
                        rating: 5,
                        title: "Absolutely love this product!",
                        comment: "I've been using this for a month now and my skin has never looked better. Highly recommend!",
                        date: "2023-05-15"
                    },
                    {
                        id: 2,
                        name: "Michael Chen",
                        profileImage: null, // User with no profile picture
                        rating: 4,
                        title: "Great quality",
                        comment: "The product is exactly as described. Works well for my skin type. Would purchase again.",
                        date: "2023-04-22"
                    }
                ];

                setReviews(mockReviews);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    const renderStars = (rating, interactive = false, onChange = null) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        onClick={() => interactive && onChange && onChange(i + 1)}
                    >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                ))}
            </div>
        );
    };

    const handleAddToCart = () => {
        setIsAddingToCart(true);
        setTimeout(() => {
            console.log(`Added ${quantity} x ${product.name} to cart.`);
            setIsAddingToCart(false);
            // You could show a success notification here
        }, 1500);
    };

    const handleBuyNow = () => {
        setIsBuyingNow(true);
        setTimeout(() => {
            console.log(`Processing purchase for ${quantity} x ${product.name}.`);
            setIsBuyingNow(false);
            // In a real app, this would navigate to a checkout page
            router.push('/checkout');
        }, 1500);
    };

    const handleReviewFormChange = (e) => {
        const { name, value } = e.target;
        setReviewForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReviewForm(prev => ({
                    ...prev,
                    profileImage: file,
                    profileImagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);

        setTimeout(() => {
            const newReview = {
                id: reviews.length + 1,
                name: reviewForm.name,
                profileImage: reviewForm.profileImagePreview, // In a real app, you'd upload the file and use the returned URL
                rating: reviewForm.rating,
                title: reviewForm.title,
                comment: reviewForm.comment,
                date: new Date().toISOString().split('T')[0]
            };

            setReviews(prev => [newReview, ...prev]);
            // Reset form
            setReviewForm({
                name: '',
                email: '',
                rating: 5,
                title: '',
                comment: '',
                profileImage: null,
                profileImagePreview: '/placeholder-avatar.png'
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
            setIsSubmittingReview(false);

            alert('Thank you for your review!');
        }, 1000);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-8">
                    <p className="text-red-500">Error: {error}</p>
                    <Link href="/products" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const productImages = [
        `https://picsum.photos/seed/${product.id}-main/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt1/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt2/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt3/800/800.jpg`,
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-gray-700">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6 hidden sm:block">
                <Link href="/" className="hover:text-gray-700">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/products" className="hover:text-gray-700">Products</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 truncate">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                        <Image
                            src={productImages[selectedImage]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                            priority
                        />
                        {product.discount > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                -{product.discount}%
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {productImages.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative overflow-hidden rounded-lg border-2 flex-shrink-0 w-20 h-20 ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'}`}
                            >
                                <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" sizes="80px" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Information */}
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">{product.brand}</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                        <div className="flex items-center">
                            {renderStars(product.rating)}
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600">({product.rating} out of 5)</span>
                            <span className="text-gray-500">({reviews.length} reviews)</span>
                        </div>
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

                    <p className="text-gray-700 text-sm sm:text-base">{product.description}</p>

                    <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
                        </span>
                    </div>

                    {/* Add to Cart and Buy Now Section */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <label htmlFor="quantity" className="text-sm font-medium text-gray-700 whitespace-nowrap">Quantity:</label>
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
                                    className="w-12 sm:w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || isAddingToCart}
                                className="py-3 px-6 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-base sm:text-lg"
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
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0 || isBuyingNow}
                                className="py-3 px-6 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-base sm:text-lg"
                            >
                                {isBuyingNow ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Buy Now'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Product Features */}
                    <div className="border-t pt-4 sm:pt-6">
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
                <div className="border-b border-gray-200 overflow-x-auto">
                    <nav className="-mb-px flex space-x-6 sm:space-x-8 min-w-max">
                        {['description', 'specifications', 'reviews', 'ingredients',].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-3 sm:py-2 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${activeTab === tab
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
                        <div className="prose max-w-none text-sm sm:text-base">
                            <p>{product.description}</p>
                            <p className="mt-4">This product is perfect for those looking for high-quality {product.category.toLowerCase()} that delivers exceptional results. Made with carefully selected ingredients, it provides a luxurious experience while being gentle on your skin.</p>
                        </div>
                    )}
                    {activeTab === 'specifications' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                            <div><span className="font-semibold">Brand:</span> {product.brand}</div>
                            <div><span className="font-semibold">Category:</span> {product.category}</div>
                            <div><span className="font-semibold">Shade:</span> {product.shade}</div>
                            <div><span className="font-semibold">Volume:</span> {product.volume}</div>
                            <div><span className="font-semibold">Skin Type:</span> {product.skinType}</div>
                            <div><span className="font-semibold">Expiration Date:</span> {product.expirationDate}</div>
                        </div>
                    )}
                    {activeTab === 'ingredients' && (
                        <div className="text-sm sm:text-base">
                            <p className="font-semibold mb-2">Full Ingredient List:</p>
                            <p className="text-gray-700">{product.ingredients.join(', ')}</p>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
                            {/* Review Form */}
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg order-2 lg:order-1">
                                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Profile Image Upload */}
                                        <div className="flex flex-col items-center sm:items-start">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                                            <div className="relative group">
                                                <Image
                                                    src={reviewForm.profileImagePreview}
                                                    alt="Profile Preview"
                                                    width={80}
                                                    height={80}
                                                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                                                />
                                                <label htmlFor="profile-upload" className="absolute inset-0 w-20 h-20 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </label>
                                                <input
                                                    ref={fileInputRef}
                                                    id="profile-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={reviewForm.name}
                                                    onChange={handleReviewFormChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={reviewForm.email}
                                                    onChange={handleReviewFormChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        {renderStars(reviewForm.rating, true, (rating) =>
                                            setReviewForm(prev => ({ ...prev, rating }))
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={reviewForm.title}
                                            onChange={handleReviewFormChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                        <textarea
                                            id="comment"
                                            name="comment"
                                            rows="4"
                                            value={reviewForm.comment}
                                            onChange={handleReviewFormChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            </div>

                            {/* Reviews List */}
                            <div className="order-1 lg:order-2">
                                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                                ) : (
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                        {reviews.map(review => (
                                            <div key={review.id} className="border-b pb-4 last:border-b-0">
                                                <div className="flex items-start space-x-3">
                                                    <Image
                                                        src={review.profileImage || '/placeholder-avatar.png'}
                                                        alt={review.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-medium text-sm sm:text-base">{review.name}</h4>
                                                            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{review.date}</span>
                                                        </div>
                                                        <div className="flex items-center mb-2">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                        <h5 className="font-medium mb-1 text-sm sm:text-base">{review.title}</h5>
                                                        <p className="text-gray-700 text-sm sm:text-base">{review.comment}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* More Products from Same Category Section */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold">More Products from {product.category}</h2>
                        <Link href={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:text-blue-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <Link href={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="group">
                                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                                    <div className="relative">
                                        <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
                                            <Image
                                                src={`https://picsum.photos/seed/${relatedProduct.id}/400/400.jpg`}
                                                alt={relatedProduct.name}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        {relatedProduct.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                -{relatedProduct.discount}%
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 sm:p-4">
                                        <p className="text-xs text-gray-500 mb-1 truncate">{relatedProduct.brand}</p>
                                        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">{relatedProduct.name}</h3>

                                        <div className="flex items-center mb-2">
                                            {renderStars(relatedProduct.rating)}
                                            <span className="ml-1 text-xs text-gray-600">({relatedProduct.rating})</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                {relatedProduct.discount > 0 ? (
                                                    <>
                                                        <span className="text-sm font-bold text-gray-900">${relatedProduct.finalPrice.toFixed(2)}</span>
                                                        <span className="text-xs text-gray-500 line-through ml-1">${relatedProduct.price.toFixed(2)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-900">${relatedProduct.price.toFixed(2)}</span>
                                                )}
                                            </div>
                                            <button
                                                className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    console.log(`Added ${relatedProduct.name} to cart`);
                                                }}
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
                </div>
            )}
        </div>
    );
};

export default ProductDetails;