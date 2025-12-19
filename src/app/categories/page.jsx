"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Grid, Table, Package, TrendingUp, Eye } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // table or card

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                
                if (data.success) {
                    // Handle the nested data structure
                    let products = [];
                    
                    if (Array.isArray(data.data)) {
                        if (data.data.length > 0 && data.data[0].data && Array.isArray(data.data[0].data)) {
                            data.data.forEach(item => {
                                if (item.data && Array.isArray(item.data)) {
                                    products = [...products, ...item.data];
                                }
                            });
                        } else {
                            products = data.data;
                        }
                    }
                    
                    // Group products by category and count them
                    const categoryMap = new Map();
                    
                    products.forEach(product => {
                        if (product.category && typeof product.category === 'string') {
                            if (categoryMap.has(product.category)) {
                                const category = categoryMap.get(product.category);
                                category.count += 1;
                                category.totalPrice += product.finalPrice || product.price || 0;
                                if (!category.imageUrl && product.imageUrl) {
                                    category.imageUrl = product.imageUrl;
                                }
                                if (!category.sampleProducts.includes(product.name) && product.name) {
                                    category.sampleProducts.push(product.name);
                                }
                                if (product.brand) {
                                    category.brands.add(product.brand);
                                }
                            } else {
                                // Initialize brands as empty Set if no brand exists
                                categoryMap.set(product.category, {
                                    name: product.category,
                                    count: 1,
                                    totalPrice: product.finalPrice || product.price || 0,
                                    imageUrl: product.imageUrl || null,
                                    sampleProducts: product.name ? [product.name] : [],
                                    brands: product.brand ? new Set([product.brand]) : new Set()
                                });
                            }
                        }
                    });
                    
                    // Convert to array format and calculate averages
                    const categoriesArray = Array.from(categoryMap.values()).map(category => ({
                        ...category,
                        averagePrice: category.count > 0 ? category.totalPrice / category.count : 0,
                        brands: Array.from(category.brands).slice(0, 3) // Show top 3 brands
                    }));
                    
                    setCategories(categoriesArray);
                } else {
                    setError('Failed to fetch categories');
                }
            } catch (err) {
                setError('An error occurred while fetching categories');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Filter categories based on search term
    const filteredCategories = categories.filter(category =>
        category.name && category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setViewMode('card');
    };

    const handleBackToTable = () => {
        setViewMode('table');
        setSelectedCategory(null);
    };

    const getCategoryColor = (index) => {
        const colors = [
            'from-purple-400 to-indigo-600',
            'from-blue-400 to-cyan-600',
            'from-green-400 to-teal-600',
            'from-yellow-400 to-orange-600',
            'from-pink-400 to-rose-600',
            'from-indigo-400 to-purple-600'
        ];
        return colors[index % colors.length];
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
                            <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                            <p className="text-gray-600">
                                {viewMode === 'table' ? 'Browse all categories' : `Viewing: ${selectedCategory?.name}`}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {viewMode === 'card' && (
                                <button
                                    onClick={handleBackToTable}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Table
                                </button>
                            )}
                            
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Products
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Top Brands
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCategories.map((category, index) => (
                                        <tr 
                                            key={category.name}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleCategoryClick(category)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${getCategoryColor(index)} flex items-center justify-center text-white font-bold`}>
                                                        {category.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 capitalize">
                                                            {category.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Package className="h-4 w-4 mr-2 text-gray-400" />
                                                    {category.count}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    ${category.averagePrice.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {category.brands && category.brands.length > 0 ? (
                                                        <>
                                                            {category.brands.slice(0, 2).map((brand, idx) => (
                                                                <span 
                                                                    key={idx}
                                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                                                >
                                                                    {brand}
                                                                </span>
                                                            ))}
                                                            {category.brands.length > 2 && (
                                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                                                    +{category.brands.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                                            No brands
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCategoryClick(category);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {filteredCategories.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No categories found matching "{searchTerm}"</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <Package className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Categories</p>
                                    <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {categories.reduce((sum, cat) => sum + cat.count, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <Grid className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Avg Products/Category</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length) : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card View */}
            {viewMode === 'card' && selectedCategory && (
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className={`relative h-48 bg-gradient-to-r ${getCategoryColor(categories.findIndex(c => c.name === selectedCategory.name))}`}>
                            {selectedCategory.imageUrl ? (
                                <img 
                                    src={selectedCategory.imageUrl} 
                                    alt={selectedCategory.name}
                                    className="w-full h-full object-cover opacity-80"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white text-6xl font-bold capitalize">
                                        {selectedCategory.name.charAt(0)}
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                                <div className="p-6 text-white">
                                    <h2 className="text-3xl font-bold capitalize">{selectedCategory.name}</h2>
                                    <p className="text-lg mt-1">{selectedCategory.count} Products Available</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Total Products</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedCategory.count}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Average Price</p>
                                    <p className="text-2xl font-bold text-gray-900">${selectedCategory.averagePrice.toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-500 mb-1">Available Brands</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedCategory.brands ? selectedCategory.brands.length : 0}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Brands</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategory.brands && selectedCategory.brands.length > 0 ? (
                                        selectedCategory.brands.map((brand, index) => (
                                            <span 
                                                key={index}
                                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                            >
                                                {brand}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No brands available</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Products</h3>
                                <div className="space-y-2">
                                    {selectedCategory.sampleProducts && selectedCategory.sampleProducts.length > 0 ? (
                                        selectedCategory.sampleProducts.slice(0, 3).map((product, index) => (
                                            <div key={index} className="flex items-center text-gray-700">
                                                <div className="h-2 w-2 bg-indigo-500 rounded-full mr-3"></div>
                                                {product}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No sample products available</p>
                                    )}
                                </div>
                            </div>
                            
                            <Link 
                                href={`/products?category=${selectedCategory.name.toLowerCase()}`}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                View All Products in {selectedCategory.name}
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;