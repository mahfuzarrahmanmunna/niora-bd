// src/app/dashboard/manage-products/page.jsx
"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon, Plus } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const router = useRouter();

  // Helper function to consistently get the product ID
  const getProductId = (product) => {
    // Use _id if it exists, otherwise use id
    return product._id?.toString() || product.id || "";
  };

  // Updated categories list to include all categories from your API response
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "accessories", label: "Accessories" },
    { value: "shoes", label: "Shoes" },
    { value: "skincare", label: "Skincare" },
    { value: "clothing", label: "Clothing" },
    { value: "bags", label: "Bags" },
    { value: "makeup", label: "Makeup" },
    { value: "home-fragrance", label: "Home Fragrance" },
    { value: "other", label: "Other" },
  ];

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted]);

  // Filter products when search term or category changes
  useEffect(() => {
    // Only filter if products is an array
    if (Array.isArray(products)) {
      filterProducts();
    }
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Normalize the response to always get an array of products
      let productsData = [];

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
    } catch (error) {
      toast.error("An error occurred while fetching products");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    // Ensure products is an array before filtering
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          (product.name &&
            product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.brand &&
            product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.id &&
            product.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (product) => {
    // Create a copy of product to avoid direct mutation
    const productCopy = { ...product };
    
    // Initialize images array if it doesn't exist
    if (!productCopy.images) {
      productCopy.images = productCopy.imageUrl ? [productCopy.imageUrl] : [];
    }
    
    setCurrentProduct(productCopy);
    setEditMode(true);
    setDeleteMode(false);
    
    // Set image previews from existing images
    setImagePreviews(productCopy.images.map((url, index) => ({
      id: index,
      url: url,
      isNew: false
    })));
    
    // Clear image files
    setImageFiles([]);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteMode(true);
    setEditMode(false);
  };

  // Function to upload images to ImgBB
  const uploadImagesToImgBB = async (files) => {
    const apiKey = 'f2f3f75de26957d089ecdb402788644c';
    const uploadPromises = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('key', apiKey);
      
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => {
          // Remove data:image/...;base64, prefix
          const base64Data = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
          formData.append('image', base64Data);
          resolve();
        };
        reader.readAsDataURL(file);
      });
      
      await base64Promise;
      
      const uploadPromise = fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      }).then(response => response.json());
      
      uploadPromises.push(uploadPromise);
    }
    
    try {
      const results = await Promise.all(uploadPromises);
      return results.map(result => {
        if (result.success) {
          return result.data.url;
        } else {
          throw new Error(result.error?.message || 'Upload failed');
        }
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productId = getProductId(currentProduct);

      if (!productId) {
        toast.error("Product ID is missing");
        setIsSubmitting(false);
        return;
      }

      // Create a clean product object without image files
      const productData = { ...currentProduct };
      delete productData.imageFile; // Remove the file object
      delete productData._id; // Remove the immutable _id field

      // Convert arrays to strings for JSON serialization
      if (productData.sizes && Array.isArray(productData.sizes)) {
        productData.sizes = productData.sizes.join(", ");
      }
      if (productData.tags && Array.isArray(productData.tags)) {
        productData.tags = productData.tags.join(", ");
      }
      if (productData.features && Array.isArray(productData.features)) {
        productData.features = productData.features.join(", ");
      }

      // Upload new images to ImgBB if there are any
      let imageUrls = [...(currentProduct.images || [])];
      if (imageFiles.length > 0) {
        setIsUploadingImages(true);
        try {
          const newImageUrls = await uploadImagesToImgBB(imageFiles);
          imageUrls = [...imageUrls, ...newImageUrls];
          toast.success('Images uploaded successfully!');
        } catch (error) {
          console.error('Error uploading images:', error);
          toast.error('Failed to upload images. Please try again.');
          setIsSubmitting(false);
          setIsUploadingImages(false);
          return;
        } finally {
          setIsUploadingImages(false);
        }
      }

      // Update the product data with the image URLs
      productData.images = imageUrls;

      console.log("Updating product with ID:", productId);
      console.log("Product data:", productData);

      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Update response:", data);

      if (response.ok) {
        toast.success("Product updated successfully!");
        fetchProducts(); // Refresh the product list
        setEditMode(false);
        setCurrentProduct(null);
        setImageFiles([]);
        setImagePreviews([]);
      } else {
        toast.error(data.message || "Failed to update product");
      }
    } catch (error) {
      toast.error("An error occurred while updating the product");
      console.error("Error updating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);

    try {
      const productId = getProductId(productToDelete);

      if (!productId) {
        toast.error("Product ID is missing");
        setIsSubmitting(false);
        return;
      }

      console.log("Deleting product with ID:", productId);

      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      console.log("Delete response:", data);

      if (response.ok) {
        toast.success("Product deleted successfully!");
        fetchProducts(); // Refresh the product list
        setDeleteMode(false);
        setProductToDelete(null);
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the product");
      console.error("Error deleting product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Check if adding these files would exceed the limit
    if (imagePreviews.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }
    
    // Add new files to existing ones
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    
    // Create previews for all files
    const newPreviews = [...imagePreviews];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          file,
          preview: reader.result,
          id: Date.now() + Math.random(), // Unique ID for each image
          isNew: true
        });
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset the file input
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
    
    // Also update the current product's images array
    const updatedImages = imagePreviews
      .filter((_, i) => i !== index)
      .map(preview => preview.url);
    
    setCurrentProduct(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculate final price when price or discount changes
    if (name === "price" || name === "discount") {
      const price =
        name === "price"
          ? parseFloat(value) || 0
          : parseFloat(currentProduct.price) || 0;
      const discount =
        name === "discount"
          ? parseFloat(value) || 0
          : parseFloat(currentProduct.discount) || 0;
      const finalPrice = price * (1 - discount / 100);
      setCurrentProduct((prev) => ({
        ...prev,
        finalPrice: finalPrice.toFixed(2),
      }));
    }
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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
        <title>Manage Products | Dashboard</title>
        <meta name="description" content="Manage your product inventory" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Product Management
              </h1>
              <p className="text-muted-foreground">
                Manage your inventory, add new products, and track stock levels
              </p>
            </div>
            <Button
              onClick={() => router.push("/add-product")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          </div>

          {/* Filters Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute left-3 top-3 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-1.5-5L7.5 7.5 7 7l-5 5.5" />
                  </svg>
                  <Input
                    placeholder="Search by name, brand, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table Card */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                {filteredProducts.length > 0
                  ? `Showing ${indexOfFirstProduct + 1}-${Math.min(
                      indexOfLastProduct,
                      filteredProducts.length
                    )} of ${filteredProducts.length} products`
                  : "No products found"}
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
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProducts.length > 0 ? (
                        currentProducts.map((product) => (
                          <TableRow key={product._id || product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {/* Display first image if available */}
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-10 w-10 rounded-md object-cover border"
                                  />
                                ) : product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-10 w-10 rounded-md object-cover border"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                    <ImageIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {product.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>
                                  ${product.finalPrice || product.price}
                                </span>
                                {product.discount > 0 && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    ${product.price}
                                  </span>
                                )}
                                {product.discount > 0 && (
                                  <span className="text-sm text-green-600">
                                    {product.discount}% OFF
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-medium ${
                                    product.stock > 10
                                      ? "text-green-600"
                                      : product.stock > 0
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {product.stock}
                                </span>
                                {product.stock <= 10 && (
                                  <Badge variant="destructive">Low Stock</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                onClick={() => handleEdit(product)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(product)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                              >
                                <path d="M12 2v20M17 7l-5-5-5 5M17 17l-5 5-5-5" />
                              </svg>
                              <h3 className="mt-2 text-lg font-medium">
                                No products found
                              </h3>
                              <p className="text-muted-foreground">
                                Get started by creating a new product.
                              </p>
                              <Button
                                className="mt-4"
                                onClick={() => router.push("/add-product")}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                New Product
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
                        Showing {indexOfFirstProduct + 1} to{" "}
                        {Math.min(indexOfLastProduct, filteredProducts.length)}{" "}
                        of {filteredProducts.length} entries
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            paginate(currentPage > 1 ? currentPage - 1 : 1)
                          }
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => paginate(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            paginate(
                              currentPage < totalPages
                                ? currentPage + 1
                                : totalPages
                            )
                          }
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

        {/* Edit Product Modal */}
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogContent className="sm:max-w-[800px] h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Make changes to your product information here.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentProduct?.name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={currentProduct?.brand || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      name="category"
                      value={currentProduct?.category || ""}
                      onValueChange={(value) =>
                        setCurrentProduct((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={currentProduct?.price || ""}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Product Images Section */}
                <div className="grid gap-2">
                  <Label>Product Images (Max 5)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload files</span>
                          <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageUpload} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                    </div>
                    
                    {/* Image previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {imagePreviews.map((image, index) => (
                            <div key={image.id} className="relative group">
                              <img 
                                src={image.preview} 
                                alt={`Product preview ${index + 1}`} 
                                className="h-24 w-full object-cover rounded-md border" 
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {imagePreviews.length} of 5 images uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Offer Price Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      value={currentProduct?.discount || 0}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="finalPrice">Final Price ($)</Label>
                    <Input
                      id="finalPrice"
                      name="finalPrice"
                      type="number"
                      value={currentProduct?.finalPrice || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={currentProduct?.stock || ""}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={currentProduct?.color || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      name="material"
                      value={currentProduct?.material || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="volume">Volume</Label>
                    <Input
                      id="volume"
                      name="volume"
                      value={currentProduct?.volume || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="sizes"
                    name="sizes"
                    value={
                      Array.isArray(currentProduct?.sizes)
                        ? currentProduct.sizes.join(", ")
                        : ""
                    }
                    onChange={(e) => {
                      const sizes = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setCurrentProduct((prev) => ({ ...prev, sizes }));
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Select
                    name="rating"
                    value={currentProduct?.rating?.toString() || "0"}
                    onValueChange={(value) =>
                      setCurrentProduct((prev) => ({
                        ...prev,
                        rating: parseFloat(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No rating</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={
                      Array.isArray(currentProduct?.tags)
                        ? currentProduct.tags.join(", ")
                        : ""
                    }
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setCurrentProduct((prev) => ({ ...prev, tags }));
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Input
                    id="features"
                    name="features"
                    value={
                      Array.isArray(currentProduct?.features)
                        ? currentProduct.features.join(", ")
                        : ""
                    }
                    onChange={(e) => {
                      const features = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setCurrentProduct((prev) => ({ ...prev, features }));
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skinType">Skin Type</Label>
                  <Input
                    id="skinType"
                    name="skinType"
                    value={currentProduct?.skinType || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    name="expirationDate"
                    type="date"
                    value={currentProduct?.expirationDate || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={currentProduct?.description || ""}
                    onChange={handleInputChange}
                    required
                    rows={3}
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
                  disabled={isSubmitting || isUploadingImages}
                >
                  {isSubmitting ? (isUploadingImages ? 'Uploading Images...' : 'Saving...') : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteMode} onOpenChange={setDeleteMode}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{productToDelete?.name}"? This
                action cannot be undone.
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
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}