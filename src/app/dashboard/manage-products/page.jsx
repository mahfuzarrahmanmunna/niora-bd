'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount: '',
        category: '',
        brand: '',
        stock: '',
        imageUrls: []
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            
            // Fixed: Changed const to let
            let productsData;
            
            if (data.success && Array.isArray(data.data)) {
                productsData = data.data;
            } else if (Array.isArray(data)) {
                productsData = data;
            } else if (data.data && Array.isArray(data.data)) {
                productsData = data.data;
            } else {
                console.error("Unexpected API response format:", data);
                throw new Error("Invalid API response format");
            }
            
            setProducts(productsData);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Upload images if any
            if (imageFiles.length > 0) {
                // Fixed: Changed const to let
                let imageUrls = [];
                
                try {
                    const newImageUrls = await uploadImagesToImgBB(imageFiles);
                    imageUrls = [...imageUrls, ...newImageUrls];
                    toast.success('Images uploaded successfully!');
                } catch (error) {
                    console.error('Error uploading images:', error);
                    toast.error('Failed to upload images');
                    setIsSubmitting(false);
                    return;
                }
                
                setFormData(prev => ({ ...prev, imageUrls }));
            }

            const url = editingProduct 
                ? `/api/products/${editingProduct.id}` 
                : '/api/products';
            
            const method = editingProduct ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully`);
                resetForm();
                fetchProducts();
            } else {
                toast.error('Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Failed to save product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const uploadImagesToImgBB = async (files) => {
        const apiKey = 'your_imgbb_api_key';
        const uploadPromises = [];
        
        for (const file of files) {
            const formData = new FormData();
            formData.append('key', apiKey);
            formData.append('image', file);
            
            const uploadPromise = fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            }).then(response => response.json());
            
            uploadPromises.push(uploadPromise);
        }
        
        const results = await Promise.all(uploadPromises);
        return results.map(result => {
            if (result.success) {
                return result.data.url;
            } else {
                throw new Error(result.error?.message || 'Upload failed');
            }
        });
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount || '',
            category: product.category,
            brand: product.brand,
            stock: product.stock,
            imageUrls: product.imageUrls || []
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    toast.success('Product deleted successfully');
                    fetchProducts();
                } else {
                    toast.error('Failed to delete product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            discount: '',
            category: '',
            brand: '',
            stock: '',
            imageUrls: []
        });
        setEditingProduct(null);
        setImageFiles([]);
    };

    // Fixed: Changed const to let
    let filtered = products;
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(
            (product) =>
                (product.name &&
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.brand &&
                    product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.category &&
                    product.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
        filtered = filtered.filter(
            (product) => product.category === selectedCategory
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand
                            </label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                value={formData.discount}
                                onChange={(e) => setFormData({...formData, discount: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock
                            </label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            required
                        ></textarea>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Images
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setImageFiles(Array.from(e.target.files))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.imageUrls.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.imageUrls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                        </button>
                        
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold">Products</h2>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {filtered.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {searchTerm || selectedCategory !== 'all' 
                            ? 'No products found matching your filters.' 
                            : 'No products found.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filtered.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                                    <img 
                                                        src={product.imageUrls[0]} 
                                                        alt={product.name}
                                                        className="h-10 w-10 rounded object-cover mr-3"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                                                        <span className="text-xs text-gray-500">No img</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.brand}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {product.category}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                ${product.price}
                                                {product.discount && (
                                                    <span className="ml-2 text-xs text-red-500">
                                                        -{product.discount}%
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${
                                                product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}