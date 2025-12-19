// app/product/[id]/page.jsx
"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  Shield, 
  RefreshCw, 
  Minus, 
  Plus,
  Check,
  X,
  ZoomIn,
  Share2,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  Award
} from 'lucide-react';

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
    const [isWishlist, setIsWishlist] = useState(false);
    const [showZoom, setShowZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [expandedSpecs, setExpandedSpecs] = useState(false);
    const fileInputRef = useRef(null);
    const imageRef = useRef(null);
    const router = useRouter();
    const [reviewForm, setReviewForm] = useState({
        name: '',
        email: '',
        rating: 5,
        title: '',
        comment: '',
        profileImage: null,
        profileImagePreview: '/placeholder-avatar.png'
    });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const params = useParams();

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch product by ID directly
                const productResponse = await fetch(`/api/products/${params.id}`);
                
                if (!productResponse.ok) {
                    throw new Error('Failed to fetch product');
                }
                
                const productData = await productResponse.json();
                
                if (!productData.success) {
                    throw new Error(productData.message || 'Product not found');
                }
                
                const foundProduct = productData.data;
                setProduct(foundProduct);

                // Fetch all products to find related ones
                const allProductsResponse = await fetch('/api/products');
                if (allProductsResponse.ok) {
                    const allProductsData = await allProductsResponse.json();
                    
                    let allProducts = [];
                    if (allProductsData.success && Array.isArray(allProductsData.data)) {
                        allProducts = allProductsData.data;
                    }
                    
                    // Get related products from same category
                    const related = allProducts.filter(p => 
                        p.category === foundProduct.category && p.id !== foundProduct.id
                    ).slice(0, 8);
                    
                    setRelatedProducts(related);
                }

                // Fetch reviews for this specific product
                try {
                    const reviewsResponse = await fetch(`/api/reviews?productId=${params.id}`);
                    if (reviewsResponse.ok) {
                        const reviewsData = await reviewsResponse.json();
                        if (reviewsData.success && reviewsData.data) {
                            setReviews(reviewsData.data);
                        } else {
                            setReviews([]);
                        }
                    } else {
                        // If reviews endpoint doesn't exist or fails, just set empty reviews
                        setReviews([]);
                    }
                } catch (err) {
                    // If reviews fetch fails, just set empty reviews
                    setReviews([]);
                    console.error('Failed to fetch reviews:', err);
                }

                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchProductData();
    }, [params.id]);

    const renderStars = (rating, interactive = false, onChange = null, size = 'normal') => {
        const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
        
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`${starSize} ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={() => interactive && onChange && onChange(i + 1)}
                    />
                ))}
            </div>
        );
    };

    const handleAddToCart = () => {
        setIsAddingToCart(true);
        setTimeout(() => {
            console.log(`Added ${quantity} x ${product.name} to cart.`);
            setIsAddingToCart(false);
            showNotification('Product added to cart!');
        }, 1500);
    };

    const handleBuyNow = () => {
        setIsBuyingNow(true);
        setTimeout(() => {
            console.log(`Processing purchase for ${quantity} x ${product.name}.`);
            setIsBuyingNow(false);
            router.push('/checkout');
        }, 1500);
    };

    const handleImageZoom = (e) => {
        const { left, top, width, height } = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
    };

    const toggleWishlist = () => {
        setIsWishlist(!isWishlist);
        showNotification(isWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    };

    const showNotification = (message) => {
        // Create a simple notification (in a real app, you'd use a toast library)
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
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
                    profileImage: reader.result, // Store as base64 for upload
                    profileImagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingReview(true);

        try {
            // Prepare review data
            const reviewData = {
                productId: params.id,
                name: reviewForm.name,
                email: reviewForm.email,
                rating: reviewForm.rating,
                title: reviewForm.title,
                comment: reviewForm.comment,
                profileImage: reviewForm.profileImage // Send the base64 image
            };
            
            // Submit review to API
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit review');
            }
            
            const result = await response.json();
            
            // Add new review to the list
            const newReview = {
                id: reviews.length + 1,
                name: reviewForm.name,
                profileImage: result.data.profileImage, // Use the URL returned from ImgBB
                rating: reviewForm.rating,
                title: reviewForm.title,
                comment: reviewForm.comment,
                date: new Date().toISOString().split('T')[0],
                verified: false
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
            
            showNotification('Thank you for your review!');
        } catch (error) {
            console.error('Error submitting review:', error);
            showNotification('Failed to submit review. Please try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-8">
                    <p className="text-red-500 text-lg mb-4">Error: {error}</p>
                    <Link href="/products" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    // Create product images array using actual image URL from product
    const productImages = [
        product.imageUrl || `https://picsum.photos/seed/${product.id}-main/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt1/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt2/800/800.jpg`,
        `https://picsum.photos/seed/${product.id}-alt3/800/800.jpg`,
    ];

    return (
        <div className="bg-gray-50">
            {/* Breadcrumb */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
                        <li className="text-gray-400">/</li>
                        <li><Link href="/products" className="text-gray-500 hover:text-gray-700">Products</Link></li>
                        <li className="text-gray-400">/</li>
                        <li className="text-gray-900 font-medium truncate">{product.name}</li>
                    </ol>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div 
                            className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square"
                            onMouseEnter={() => setShowZoom(true)}
                            onMouseLeave={() => setShowZoom(false)}
                            onMouseMove={handleImageZoom}
                            ref={imageRef}
                        >
                            <Image
                                src={productImages[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />
                            
                            {/* Zoom indicator */}
                            <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md opacity-0 hover:opacity-100 transition-opacity">
                                <ZoomIn className="h-5 w-5 text-gray-700" />
                            </div>
                            
                            {/* Discount badge */}
                            {product.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                                    -{product.discount}% OFF
                                </div>
                            )}
                            
                            {/* Wishlist button */}
                            <button
                                onClick={toggleWishlist}
                                className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md"
                            >
                                <Heart className={`h-5 w-5 ${isWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                            </button>
                            
                            {/* Share button */}
                            <button className="absolute bottom-4 left-4 bg-white rounded-full p-2 shadow-md">
                                <Share2 className="h-5 w-5 text-gray-700" />
                            </button>
                        </div>
                        
                        {/* Thumbnail images */}
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                            {productImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative overflow-hidden rounded-md border-2 flex-shrink-0 w-20 h-20 ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'}`}
                                >
                                    <Image
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
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

                        {/* Rating and Reviews */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                {renderStars(product.rating || 0)}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{product.rating || 0}</span> out of 5
                            </div>
                            <div className="text-sm text-gray-500">
                                ({reviews.length} reviews)
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline space-x-3">
                            <span className="text-3xl font-bold text-gray-900">
                                ${product.finalPrice || product.price}
                            </span>
                            {product.discount > 0 && (
                                <>
                                    <span className="text-xl text-gray-500 line-through">
                                        ${product.price}
                                    </span>
                                    <span className="text-sm text-red-500 font-semibold">
                                        Save ${(product.price - product.finalPrice).toFixed(2)}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-600">{product.description}</p>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-2">
                            {product.stock > 0 ? (
                                <>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-red-600 font-medium">Out of Stock</span>
                                </>
                            )}
                        </div>

                        {/* Product Options */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Size</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Options */}
                        {product.color && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Color</h3>
                                <div className="flex items-center space-x-2">
                                    <div 
                                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                                        style={{ backgroundColor: product.color.toLowerCase() }}
                                    ></div>
                                    <span className="text-gray-700">{product.color}</span>
                                </div>
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="font-medium">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:bg-gray-100 focus:outline-none"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 hover:bg-gray-100 focus:outline-none"
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || product.stock === 0}
                                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isBuyingNow || product.stock === 0}
                                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isBuyingNow ? 'Processing...' : 'Buy Now'}
                                </button>
                            </div>
                        </div>

                        {/* Product Features */}
                        {product.features && product.features.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                                <ul className="space-y-2">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Shipping & Returns */}
                        <div className="border-t pt-6 space-y-4">
                            <h3 className="text-lg font-semibold mb-4">Shipping & Returns</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                    <Truck className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Free Shipping</h4>
                                        <p className="text-sm text-gray-600">On orders over $50</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Shield className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">1-Year Warranty</h4>
                                        <p className="text-sm text-gray-600">Against manufacturing defects</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <RefreshCw className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">30-Day Returns</h4>
                                        <p className="text-sm text-gray-600">Hassle-free returns</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Package className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Secure Packaging</h4>
                                        <p className="text-sm text-gray-600">Damage-free delivery</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-16">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {['description', 'specifications', 'reviews', 'ingredients'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                                        activeTab === tab
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
                                <p className="text-gray-700">{product.description}</p>
                                <p className="mt-4 text-gray-700">
                                    This product is perfect for those looking for high-quality {product.category.toLowerCase()} that delivers exceptional results. 
                                    Made with carefully selected ingredients, it provides a luxurious experience while being gentle on your skin.
                                </p>
                                <p className="mt-4 text-gray-700">
                                    Our commitment to quality ensures that every product meets the highest standards of excellence. 
                                    Try it today and experience the difference for yourself.
                                </p>
                            </div>
                        )}
                        {activeTab === 'specifications' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">Brand</span>
                                            <span className="text-gray-700">{product.brand}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">Category</span>
                                            <span className="text-gray-700 capitalize">{product.category}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">Color</span>
                                            <span className="text-gray-700">{product.color}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">Shade</span>
                                            <span className="text-gray-700">{product.shade}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">Volume</span>
                                            <span className="text-gray-700">{product.volume}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">Material</span>
                                            <span className="text-gray-700">{product.material}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">Skin Type</span>
                                            <span className="text-gray-700">{product.skinType || 'All skin types'}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="font-medium text-gray-900">Expiration Date</span>
                                            <span className="text-gray-700">{product.expirationDate || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Expandable specifications */}
                                <div className="mt-4">
                                    <button 
                                        onClick={() => setExpandedSpecs(!expandedSpecs)}
                                        className="flex items-center justify-between w-full py-2 text-blue-600 font-medium"
                                    >
                                        <span>Additional Information</span>
                                        {expandedSpecs ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </button>
                                    {expandedSpecs && (
                                        <div className="mt-4 space-y-4 text-sm text-gray-600">
                                            <p>This product has been tested and approved by dermatologists for safety and efficacy.</p>
                                            <p>Manufactured in a facility that follows strict quality control standards.</p>
                                            <p>Not tested on animals. 100% cruelty-free formulation.</p>
                                            <p>Recommended for daily use for best results.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'ingredients' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Full Ingredient List</h3>
                                <div className="prose max-w-none">
                                    {product.ingredients && product.ingredients.length > 0 ? (
                                        <p className="text-gray-700">{product.ingredients.join(', ')}</p>
                                    ) : (
                                        <p className="text-gray-700">No ingredients information available.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Review Summary */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                                        
                                        {/* Average Rating */}
                                        <div className="text-center mb-6">
                                            <div className="text-4xl font-bold text-gray-900">
                                                {reviews.length > 0 ? 
                                                    (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                                                    : '0.0'
                                                }
                                            </div>
                                            <div className="flex justify-center my-2">
                                                {reviews.length > 0 ? 
                                                    renderStars(
                                                        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                                                    )
                                                    : renderStars(0)
                                                }
                                            </div>
                                            <p className="text-gray-600">Based on {reviews.length} reviews</p>
                                        </div>
                                        
                                        {/* Rating Breakdown */}
                                        {reviews.length > 0 && (
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map((rating) => {
                                                    const count = reviews.filter(r => r.rating === rating).length;
                                                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                                    
                                                    return (
                                                        <div key={rating} className="flex items-center">
                                                            <span className="text-sm w-8">{rating}</span>
                                                            <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                                                            <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-yellow-400" 
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm w-10 text-right">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Reviews List and Form */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Review Form */}
                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center">
                                                    <Image
                                                        src={reviewForm.profileImagePreview}
                                                        alt="Profile Preview"
                                                        width={60}
                                                        height={60}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                                    />
                                                    <label htmlFor="profile-upload" className="ml-3 text-blue-600 hover:text-blue-700 cursor-pointer">
                                                        Change Photo
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
                                    <div className="space-y-6">
                                        {reviews.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
                                        ) : (
                                            reviews.map(review => (
                                                <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                                                    <div className="flex items-start space-x-4">
                                                        <Image
                                                            src={review.profileImage || '/placeholder-avatar.png'}
                                                            alt={review.name}
                                                            width={60}
                                                            height={60}
                                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-medium text-gray-900">{review.name}</h4>
                                                                <span className="text-sm text-gray-500">{review.date}</span>
                                                            </div>
                                                            <div className="flex items-center mb-2">
                                                                {renderStars(review.rating, false, null, 'small')}
                                                                {review.verified && (
                                                                    <div className="ml-2 flex items-center text-xs text-green-600">
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Verified Purchase
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
                                                            <p className="text-gray-700">{review.comment}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">More Products from {product.category}</h2>
                            <Link href={`/products?category=${product.category.toLowerCase()}`} className="text-blue-600 hover:text-blue-700 font-medium">
                                View All
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link href={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="group">
                                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                                        <div className="relative">
                                            <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
                                                <Image
                                                    src={relatedProduct.imageUrl || `https://picsum.photos/seed/${relatedProduct.id}/400/400.jpg`}
                                                    alt={relatedProduct.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                />
                                            </div>
                                            {relatedProduct.discount > 0 && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                    -{relatedProduct.discount}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="text-xs text-gray-500 mb-1 truncate">{relatedProduct.brand}</p>
                                            <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">{relatedProduct.name}</h3>
                                            <div className="flex items-center mb-2">
                                                {renderStars(relatedProduct.rating || 0, false, null, 'small')}
                                                <span className="ml-1 text-xs text-gray-600">({relatedProduct.rating || 0})</span>
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
                                                        showNotification(`Added ${relatedProduct.name} to cart`);
                                                    }}
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
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
        </div>
    );
};

export default ProductDetails;