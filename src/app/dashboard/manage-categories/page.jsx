// pages/manage-categories.js
'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage] = useState(10);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();

    // Ensure component is mounted on client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch categories on component mount
    useEffect(() => {
        if (mounted) {
            fetchCategories();
        }
    }, [mounted]);

    // Filter categories when search term changes
    useEffect(() => {
        filterCategories();
    }, [categories, searchTerm]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/categories');
            
            // Check if response is ok before parsing JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                
                if (data.success) {
                    // Handle different possible response structures
                    let categoriesData = [];
                    
                    if (Array.isArray(data.data)) {
                        categoriesData = data.data;
                    } else if (data.data && Array.isArray(data.data)) {
                        categoriesData = data.data;
                    } else if (data.data && data.data.data && Array.isArray(data.data.data)) {
                        categoriesData = data.data.data;
                    }
                    
                    setCategories(categoriesData);
                } else {
                    toast.error(data.message || 'Failed to fetch categories');
                }
            } else {
                // Handle non-JSON response (like HTML)
                const text = await response.text();
                console.error('Non-JSON response:', text);
                toast.error('Unexpected response format from server');
            }
        } catch (error) {
            toast.error('An error occurred while fetching categories');
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterCategories = () => {
        let filtered = [...categories];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(category =>
                category.name && category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (category.id && category.id.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredCategories(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleEdit = (category) => {
        // Create a copy of the category to avoid direct mutation
        const categoryCopy = { ...category };
        setCurrentCategory(categoryCopy);
        setEditMode(true);
        setDeleteMode(false);
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setDeleteMode(true);
        setEditMode(false);
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const categoryId = currentCategory.id || currentCategory._id?.toString();

            const response = await fetch(`/api/categories/${encodeURIComponent(categoryId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentCategory),
            });

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();

                if (response.ok) {
                    toast.success('Category updated successfully!');
                    fetchCategories(); // Refresh the category list
                    setEditMode(false);
                    setCurrentCategory(null);
                } else {
                    toast.error(data.message || 'Failed to update category');
                }
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                toast.error('Unexpected response format from server');
            }
        } catch (error) {
            toast.error('An error occurred while updating the category');
            console.error('Error updating category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        setIsSubmitting(true);

        try {
            const categoryId = categoryToDelete.id || categoryToDelete._id?.toString();

            const response = await fetch(`/api/categories/${encodeURIComponent(categoryId)}`, {
                method: 'DELETE',
            });

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();

                if (response.ok) {
                    toast.success('Category deleted successfully!');
                    fetchCategories(); // Refresh the category list
                    setDeleteMode(false);
                    setCategoryToDelete(null);
                } else {
                    toast.error(data.message || 'Failed to delete category');
                }
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                toast.error('Unexpected response format from server');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the category');
            console.error('Error deleting category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCategory(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Pagination
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Don't render until mounted
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Manage Categories | Dashboard</title>
                <meta name="description" content="Manage your product categories" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                            <p className="text-muted-foreground">
                                Manage your product categories and organize your inventory
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push('/add-category')}
                            className="flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add New Category
                        </Button>
                    </div>

                    {/* Filters Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Filter Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-muted-foreground">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-1.5-5L7.5 7.5 7 7l-5 5.5" />
                                    </svg>
                                    <Input
                                        placeholder="Search by name or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories Table Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>
                                {filteredCategories.length > 0
                                    ? `Showing ${indexOfFirstCategory + 1}-${Math.min(indexOfLastCategory, filteredCategories.length)} of ${filteredCategories.length} categories`
                                    : "No categories found"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Product Count</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentCategories.length > 0 ? (
                                                currentCategories.map((category) => (
                                                    <TableRow key={category._id || category.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                {category.imageUrl && (
                                                                    <img
                                                                        src={category.imageUrl}
                                                                        alt={category.name}
                                                                        className="h-10 w-10 rounded-md object-cover border"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <div className="font-medium">{category.name}</div>
                                                                    <div className="text-sm text-muted-foreground">ID: {category.id}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="max-w-xs truncate">
                                                                {category.description || 'No description available'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{category.productCount || 0} products</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="mr-2"
                                                                onClick={() => handleEdit(category)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(category)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                                                                <path d="M12 2v20M17 7l-5-5-5 5M17 17l-5 5-5-5" />
                                                            </svg>
                                                            <h3 className="mt-2 text-lg font-medium">No categories found</h3>
                                                            <p className="text-muted-foreground">Get started by creating a new category.</p>
                                                            <Button
                                                                className="mt-4"
                                                                onClick={() => router.push('/add-category')}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                                    <path d="M12 5v14M5 12h14" />
                                                                </svg>
                                                                New Category
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between space-x-2 py-4">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {indexOfFirstCategory + 1} to {Math.min(indexOfLastCategory, filteredCategories.length)} of {filteredCategories.length} entries
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => paginate(page)}
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Category Modal */}
                <Dialog open={editMode} onOpenChange={setEditMode}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>
                                Make changes to your category information here.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateCategory}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={currentCategory?.name || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={currentCategory?.description || ''}
                                        onChange={handleInputChange}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="imageUrl">Image URL</Label>
                                    <Input
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={currentCategory?.imageUrl || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditMode(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteMode} onOpenChange={setDeleteMode}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Delete Category</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeleteMode(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmDelete}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}