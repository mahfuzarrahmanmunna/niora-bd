// app/category/[slug]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const AllCategoryPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryName, setCategoryName] = useState('');
    const [debugInfo, setDebugInfo] = useState({}); // For debugging
    const productsPerPage = 12;

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Extract slug from pathname
    const getSlugFromPathname = () => {
        const pathSegments = pathname.split('/');
        return pathSegments[pathSegments.length - 1];
    };

    // Convert URL slug back to category name
    const getCategoryName = (slug) => {
        if (!slug) return '';
        return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Set category name from pathname
    useEffect(() => {
        const slug = getSlugFromPathname();
        console.log('Pathname:', pathname);
        console.log('Extracted slug:', slug);

        if (slug) {
            const name = getCategoryName(slug);
            console.log('Converted category name:', name);
            setCategoryName(name);
            setDebugInfo(prev => ({ ...prev, slug, categoryName: name }));
        } else {
            console.log('No slug found in pathname');
            setDebugInfo(prev => ({ ...prev, slug: 'undefined', categoryName: 'undefined' }));
        }
    }, [pathname]);

    // Fetch products and categories
    useEffect(() => {
        // if (!categoryName) {
        //     console.log('Category name is empty, skipping fetch');
        //     return; // Don't fetch until categoryName is set
        // }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Log for debugging
                console.log('Fetching data for category:', categoryName);
                setDebugInfo(prev => ({ ...prev, fetchingFor: categoryName }));

                const response = await fetch('/data.json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();

                // Log for debugging
                console.log('Data fetched:', data.length, 'products');
                setDebugInfo(prev => ({ ...prev, totalProducts: data.length }));

                // Extract unique categories
                const uniqueCategories = [...new Set(data.map(product => product.category))];
                setCategories(uniqueCategories);

                // Log for debugging
                console.log('Categories found:', uniqueCategories);
                setDebugInfo(prev => ({ ...prev, categories: uniqueCategories }));

                // Filter products by category (case-insensitive comparison)
                const categoryProducts = data.filter(product =>
                    product.category && product.category.toLowerCase() === categoryName.toLowerCase()
                );

                // Log for debugging
                console.log('Products in category:', categoryProducts.length);
                setDebugInfo(prev => ({ ...prev, categoryProducts: categoryProducts.length }));

                if (categoryProducts.length === 0) {
                    setError(`No products found in the "${categoryName}" category. Available categories: ${uniqueCategories.join(', ')}`);
                } else {
                    setProducts(categoryProducts);
                    setFilteredProducts(categoryProducts);

                    // Set price range based on products
                    const prices = categoryProducts.map(p => p.finalPrice || p.price);
                    setPriceRange({
                        min: Math.min(...prices),
                        max: Math.max(...prices)
                    });
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [categoryName]);

    // Get unique brands from filtered products
    const brands = [...new Set(products.map(product => product.brand))];

    // Apply filters and search
    useEffect(() => {
        let filtered = [...products];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(product =>
                selectedBrands.includes(product.brand)
            );
        }

        // Apply price filter
        filtered = filtered.filter(product => {
            const price = product.finalPrice || product.price;
            return price >= priceRange.min && price <= priceRange.max;
        });

        // Apply sorting
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price));
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
            default:
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [products, searchQuery, sortBy, priceRange, selectedBrands]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // Render star rating
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
                <span className="ml-1 text-sm text-gray-600">({rating})</span>
            </div>
        );
    };

    // Handle brand filter toggle
    const handleBrandToggle = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedBrands([]);
        setSortBy('name');
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="h-48 bg-gray-300 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-bold text-blue-800 mb-2">Debug Information:</h3>
                            <pre className="text-xs text-blue-700 overflow-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                            Go back home
                        </Link>
                        <Link href="/categories" className="block">
                            <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                Browse all categories
                            </button>
                        </Link>
                    </div>

                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
                            <h3 className="font-bold text-blue-800 mb-2">Debug Information:</h3>
                            <pre className="text-xs text-blue-700 overflow-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Breadcrumb */}
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link href="/" className="text-gray-500 hover:text-gray-700">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-400">/</span>
                            </li>
                            <li>
                                <Link href="/categories" className="text-gray-500 hover:text-gray-700">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-400">/</span>
                            </li>
                            <li>
                                <span className="text-gray-900 font-medium">{categoryName}</span>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
                    <p className="text-gray-600">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                            >
                                <span className="font-medium text-gray-700">Filters</span>
                                <svg className={`w-5 h-5 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white rounded-lg shadow-sm p-6`}>
                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Sort */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="name">Name</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Rating</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                                        placeholder="Min"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <input
                                        type="number"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 1000 }))}
                                        placeholder="Max"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Brand Filter */}
                            {brands.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {brands.map(brand => (
                                            <label key={brand} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => handleBrandToggle(brand)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">{brand}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear Filters */}
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {paginatedProducts.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {paginatedProducts.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                                        >
                                            <div className="relative h-48 bg-gray-100">
                                                <Image
                                                    src={`https://picsum.photos/seed/${product.id}/300/300.jpg`}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                {product.discount > 0 && (
                                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        -{product.discount}%
                                                    </span>
                                                )}
                                                {product.stock < 10 && (
                                                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                                                <div className="mb-2">
                                                    {renderRating(product.rating)}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        {product.discount > 0 ? (
                                                            <>
                                                                <span className="text-lg font-bold text-gray-900">
                                                                    ${product.finalPrice.toFixed(2)}
                                                                </span>
                                                                <span className="text-sm text-gray-500 line-through ml-2">
                                                                    ${product.price.toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold text-gray-900">
                                                                ${product.price.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {product.volume}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <nav className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === i + 1
                                                        ? 'text-white bg-indigo-600'
                                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllCategoryPage;