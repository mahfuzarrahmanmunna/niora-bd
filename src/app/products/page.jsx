"use client";
import React, { useEffect, useState, useSearchParams } from 'react';
import Link from 'next/link';
import { Search, Filter, Grid, List, ArrowLeft, Star, ShoppingCart, Heart, ChevronDown } from 'lucide-react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('grid');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [isClient, setIsClient] = useState(false);
    
    const searchParams = useNextSearchParams();
    
    // Get category from URL after component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const categoryFromUrl = isClient ? searchParams.get('category') : null;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                
                if (data.success) {
                    // Handle the nested data structure
                    let allProducts = [];
                    
                    if (Array.isArray(data.data)) {
                        if (data.data.length > 0 && data.data[0].data && Array.isArray(data.data[0].data)) {
                            data.data.forEach(item => {
                                if (item.data && Array.isArray(item.data)) {
                                    allProducts = [...allProducts, ...item.data];
                                }
                            });
                        } else {
                            allProducts = data.data;
                        }
                    }
                    
                    setProducts(allProducts);
                    
                    // Extract unique categories
                    const uniqueCategories = [...new Set(
                        allProducts
                            .map(product => product.category)
                            .filter(category => category && typeof category === 'string')
                    )];
                    setCategories(uniqueCategories);
                    
                    // Set the selected category from URL
                    if (categoryFromUrl) {
                        setSelectedCategory(categoryFromUrl);
                    }
                } else {
                    setError('Failed to fetch products');
                }
            } catch (err) {
                setError('An error occurred while fetching products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryFromUrl]);

    useEffect(() => {
        // Filter products based on category, search term, and price range
        let filtered = products;
        
        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(product => 
                product.category === selectedCategory
            );
        }
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product => 
                product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by price range
        filtered = filtered.filter(product => {
            const price = product.finalPrice || product.price || 0;
            return price >= priceRange.min && price <= priceRange.max;
        });
        
        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'price-low':
                    return (a.finalPrice || a.price || 0) - (b.finalPrice || b.price || 0);
                case 'price-high':
                    return (b.finalPrice || b.price || 0) - (a.finalPrice || a.price || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });
        
        setFilteredProducts(filtered);
    }, [products, selectedCategory, searchTerm, sortBy, priceRange]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handlePriceRangeChange = (type, value) => {
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSortBy('name');
        setPriceRange({ min: 0, max: 1000 });
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        } else {
            setSelectedCategory('');
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
        }
        
        if (hasHalfStar) {
            stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
        }
        
        return stars;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
                            </h1>
                            <p className="text-gray-600">
                                Showing {filteredProducts.length} of {products.length} products
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Link href="/categories" className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Categories
                            </Link>
                            
                            <div className="flex items-center gap-2 bg-white border rounded-md">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-l-md ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                    aria-label="Grid view"
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-r-md ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                    aria-label="List view"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                                >
                                    <Filter className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                                {/* Search */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Category Filter */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Price Range */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Min"
                                                value={priceRange.min}
                                                onChange={(e) => handlePriceRangeChange('min', Number(e.target.value))}
                                            />
                                        </div>
                                        <span className="text-gray-500">-</span>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Max"
                                                value={priceRange.max}
                                                onChange={(e) => handlePriceRangeChange('max', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Sort By */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                    <select
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="name">Name</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Rating</option>
                                    </select>
                                </div>
                                
                                {/* Reset Filters */}
                                <button
                                    onClick={resetFilters}
                                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Products Grid/List */}
                    <div className="lg:w-3/4">
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <p className="text-gray-500 text-lg">No products found matching your criteria</p>
                                <button
                                    onClick={resetFilters}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' 
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                                : "space-y-4"
                            }>
                                {filteredProducts.map(product => (
                                    <div key={product.id || product._id} className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''}`}>
                                        {/* Product Image */}
                                        <div className={viewMode === 'grid' ? 'h-48' : 'h-32 w-32 flex-shrink-0'}>
                                            <img 
                                                src={product.imageUrl || 'https://picsum.photos/seed/product/300/200.jpg'} 
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        
                                        {/* Product Details */}
                                        <div className={`p-4 ${viewMode === 'list' ? 'flex-grow' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                                                <button className="p-1 rounded-full hover:bg-gray-100">
                                                    <Heart className="h-4 w-4 text-gray-400" />
                                                </button>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                                            
                                            <div className="flex items-center mb-2">
                                                {renderStars(product.rating || 0)}
                                                <span className="ml-1 text-sm text-gray-500">({product.rating || 0})</span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                            
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {product.discount > 0 ? (
                                                        <div>
                                                            <span className="text-lg font-semibold text-gray-900">${product.finalPrice || (product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                                                            <span className="ml-2 text-sm text-gray-500 line-through">${product.price}</span>
                                                            <span className="ml-1 text-sm text-red-500">({product.discount}% off)</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-lg font-semibold text-gray-900">${product.finalPrice || product.price}</span>
                                                    )}
                                                </div>
                                                
                                                <button className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                                    <ShoppingCart className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;