'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
    });
    const [editingCategory, setEditingCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            // Fixed: Changed const to let
            let categoriesData;
            
            if (Array.isArray(data.data)) {
                categoriesData = data.data;
            } else if (data.data && Array.isArray(data.data)) {
                categoriesData = data.data;
            } else if (data.data && data.data.data && Array.isArray(data.data.data)) {
                categoriesData = data.data.data;
            }

            setCategories(categoriesData || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingCategory 
                ? `/api/categories/${editingCategory.id}` 
                : '/api/categories';
            
            const method = editingCategory ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
                setFormData({ name: '', description: '', image: '' });
                setEditingCategory(null);
                fetchCategories();
            } else {
                toast.error('Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            image: category.image
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    toast.success('Category deleted successfully');
                    fetchCategories();
                } else {
                    toast.error('Failed to delete category');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    // Fixed: Changed const to let
    let filtered = categories;
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(category =>
            category.name && category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.id && category.id.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
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
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        ></textarea>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                        </label>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                        </button>
                        
                        {editingCategory && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingCategory(null);
                                    setFormData({ name: '', description: '', image: '' });
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Categories</h2>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                {filtered.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {searchTerm ? 'No categories found matching your search.' : 'No categories found.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filtered.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {category.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">
                                                {category.description || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.image ? (
                                                <img 
                                                    src={category.image} 
                                                    alt={category.name}
                                                    className="h-10 w-10 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                                    <span className="text-xs text-gray-500">No img</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
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