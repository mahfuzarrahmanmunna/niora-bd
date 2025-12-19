// pages/add-product.js
'use client';
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AddProduct() {
    const [productData, setProductData] = useState({
        id: '',
        name: '',
        brand: '',
        category: 'cosmetics',
        price: '',
        discount: '',
        finalPrice: '',
        color: '',
        shade: '',
        volume: '',
        sizes: [],
        material: '',
        description: '',
        rating: 0,
        stock: '',
        imageUrl: '',
        expirationDate: '',
        skinType: '',
        features: [],
        ingredients: [],
        tags: []
    });

    const [newFeature, setNewFeature] = useState('');
    const [newIngredient, setNewIngredient] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newBrand, setNewBrand] = useState('');
    const [newMaterial, setNewMaterial] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    // Predefined options
    const [brands, setBrands] = useState(['SunGuard', 'Nike', 'Adidas', 'Zara', 'H&M', 'Cotton On']);
    const [materials, setMaterials] = useState(['Cotton', 'Polyester', 'Wool', 'Silk', 'Denim', 'Leather', 'Nylon', 'Rayon']);

    const categories = [
        { value: 'cosmetics', label: 'Cosmetics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'shoes', label: 'Shoes' },
        { value: 'blankets', label: 'Blankets' },
        { value: 'accessories', label: 'Accessories' },
        { value: 'other', label: 'Other' }
    ];

    const skinTypes = ['All skin types', 'Dry', 'Oily', 'Combination', 'Sensitive'];
    const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
    const shoeSizes = Array.from({ length: 30 }, (_, i) => i + 5); // Sizes 5-34
    const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Multi-color'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: value
        }));

        // Calculate final price when price or discount changes
        if (name === 'price' || name === 'discount') {
            const price = name === 'price' ? parseFloat(value) || 0 : parseFloat(productData.price) || 0;
            const discount = name === 'discount' ? parseFloat(value) || 0 : parseFloat(productData.discount) || 0;
            const finalPrice = price * (1 - discount / 100);
            setProductData(prev => ({
                ...prev,
                finalPrice: finalPrice.toFixed(2)
            }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSizeChange = (size) => {
        setProductData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setProductData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        setProductData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const addIngredient = () => {
        if (newIngredient.trim()) {
            setProductData(prev => ({
                ...prev,
                ingredients: [...prev.ingredients, newIngredient.trim()]
            }));
            setNewIngredient('');
        }
    };

    const removeIngredient = (index) => {
        setProductData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const addTag = () => {
        if (newTag.trim()) {
            setProductData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (index) => {
        setProductData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const addBrand = () => {
        if (newBrand.trim() && !brands.includes(newBrand.trim())) {
            setBrands(prev => [...prev, newBrand.trim()]);
            setProductData(prev => ({
                ...prev,
                brand: newBrand.trim()
            }));
            setNewBrand('');
        }
    };

    const addMaterial = () => {
        if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
            setMaterials(prev => [...prev, newMaterial.trim()]);
            setProductData(prev => ({
                ...prev,
                material: newMaterial.trim()
            }));
            setNewMaterial('');
        }
    };

    const uploadImage = async (file) => {
        // In a real application, you would upload image to a server or cloud storage
        // For now, we'll simulate this with a mock function
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate a mock URL for the uploaded image
                const mockUrl = `https://example.com/images/${Math.random().toString(36).substring(7)}.jpg`;
                resolve(mockUrl);
            }, 1000);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Generate ID if not provided
            let productId = productData.id;
            if (!productId) {
                const categoryId = productData.category.substring(0, 3).toUpperCase();
                const randomId = Math.floor(1000 + Math.random() * 9000);
                productId = `${categoryId}${randomId}`;
            }

            // Prepare data for submission
            const submissionData = {
                ...productData,
                id: productId,
                price: parseFloat(productData.price),
                discount: parseFloat(productData.discount) || 0,
                finalPrice: parseFloat(productData.finalPrice),
                stock: parseInt(productData.stock),
                rating: parseFloat(productData.rating)
            };

            // Handle image upload if present
            if (imageFile) {
                try {
                    const imageUrl = await uploadImage(imageFile);
                    submissionData.imageUrl = imageUrl;
                } catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('Failed to upload image. Please try again.');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Send data to API
            const response = await fetch('/api/add-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Product added successfully!');
                
                // Redirect to manage products page after successful submission
                setTimeout(() => {
                    router.push('/manage-products');
                }, 1500);
            } else {
                // Handle API error
                toast.error(data.message || 'Failed to add product. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCategorySpecificFields = () => {
        switch (productData.category) {
            case 'cosmetics':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="shade">Shade</Label>
                            <Input
                                id="shade"
                                name="shade"
                                value={productData.shade}
                                onChange={handleInputChange}
                                placeholder="e.g. Light, Medium, Dark"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="volume">Volume</Label>
                            <Input
                                id="volume"
                                name="volume"
                                value={productData.volume}
                                onChange={handleInputChange}
                                placeholder="e.g. 150ml"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="expirationDate">Expiration Date</Label>
                            <Input
                                id="expirationDate"
                                name="expirationDate"
                                type="date"
                                value={productData.expirationDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="skinType">Skin Type</Label>
                            <Select
                                name="skinType"
                                value={productData.skinType}
                                onValueChange={(value) => setProductData(prev => ({ ...prev, skinType: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select skin type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {skinTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 grid gap-2">
                            <Label htmlFor="ingredients">Ingredients</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newIngredient}
                                    onChange={(e) => setNewIngredient(e.target.value)}
                                    placeholder="Add ingredient"
                                />
                                <Button type="button" onClick={addIngredient}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {productData.ingredients.map((ingredient, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {ingredient}
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'clothing':
            case 'blankets':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Sizes</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {clothingSizes.map(size => (
                                    <div key={size} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`size-${size}`}
                                            checked={productData.sizes.includes(size)}
                                            onCheckedChange={() => handleSizeChange(size)}
                                        />
                                        <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="material">Material</Label>
                            <div className="flex gap-2">
                                <Select
                                    name="material"
                                    value={productData.material}
                                    onValueChange={(value) => setProductData(prev => ({ ...prev, material: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materials.map(material => (
                                            <SelectItem key={material} value={material}>{material}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" onClick={() => document.getElementById('new-material-input').classList.toggle('hidden')}>
                                    +
                                </Button>
                            </div>
                            <div id="new-material-input" className="hidden flex gap-2 mt-2">
                                <Input
                                    value={newMaterial}
                                    onChange={(e) => setNewMaterial(e.target.value)}
                                    placeholder="Add new material"
                                />
                                <Button type="button" onClick={addMaterial}>Add</Button>
                            </div>
                        </div>
                    </div>
                );

            case 'shoes':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Sizes</Label>
                            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                                {shoeSizes.map(size => (
                                    <div key={size} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`size-${size}`}
                                            checked={productData.sizes.includes(size.toString())}
                                            onCheckedChange={() => handleSizeChange(size.toString())}
                                        />
                                        <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="material">Material</Label>
                            <div className="flex gap-2">
                                <Select
                                    name="material"
                                    value={productData.material}
                                    onValueChange={(value) => setProductData(prev => ({ ...prev, material: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materials.map(material => (
                                            <SelectItem key={material} value={material}>{material}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" onClick={() => document.getElementById('new-material-input').classList.toggle('hidden')}>
                                    +
                                </Button>
                            </div>
                            <div id="new-material-input" className="hidden flex gap-2 mt-2">
                                <Input
                                    value={newMaterial}
                                    onChange={(e) => setNewMaterial(e.target.value)}
                                    placeholder="Add new material"
                                />
                                <Button type="button" onClick={addMaterial}>Add</Button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Head>
                <title>Add Product | Dashboard</title>
                <meta name="description" content="Add a new product to your inventory" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Product</CardTitle>
                            <CardDescription>
                                Fill in the information below to add a new product to your inventory.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Product Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={productData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Sunscreen Lotion SPF 50"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="brand">Brand</Label>
                                        <div className="flex gap-2">
                                            <Select
                                                name="brand"
                                                value={productData.brand}
                                                onValueChange={(value) => setProductData(prev => ({ ...prev, brand: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select brand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map(brand => (
                                                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button type="button" variant="outline" onClick={() => document.getElementById('new-brand-input').classList.toggle('hidden')}>
                                                +
                                            </Button>
                                        </div>
                                        <div id="new-brand-input" className="hidden flex gap-2 mt-2">
                                            <Input
                                                value={newBrand}
                                                onChange={(e) => setNewBrand(e.target.value)}
                                                placeholder="Add new brand"
                                            />
                                            <Button type="button" onClick={addBrand}>Add</Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            name="category"
                                            value={productData.category}
                                            onValueChange={(value) => setProductData(prev => ({ ...prev, category: value }))}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(category => (
                                                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="id">Product ID (Optional)</Label>
                                        <Input
                                            id="id"
                                            name="id"
                                            value={productData.id}
                                            onChange={handleInputChange}
                                            placeholder="e.g. COS025 (Auto-generated if empty)"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price ($)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={productData.price}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            placeholder="22.99"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="discount">Discount (%)</Label>
                                        <Input
                                            id="discount"
                                            name="discount"
                                            type="number"
                                            value={productData.discount}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            placeholder="15"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="finalPrice">Final Price ($)</Label>
                                        <Input
                                            id="finalPrice"
                                            name="finalPrice"
                                            type="number"
                                            value={productData.finalPrice}
                                            readOnly
                                            className="bg-muted"
                                            placeholder="Auto-calculated"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color</Label>
                                        <Select
                                            name="color"
                                            value={productData.color}
                                            onValueChange={(value) => setProductData(prev => ({ ...prev, color: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {colors.map(color => (
                                                    <SelectItem key={color} value={color}>{color}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="stock">Stock Quantity</Label>
                                        <Input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            value={productData.stock}
                                            onChange={handleInputChange}
                                            min="0"
                                            placeholder="145"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="rating">Rating</Label>
                                        <Select
                                            name="rating"
                                            value={productData.rating.toString()}
                                            onValueChange={(value) => setProductData(prev => ({ ...prev, rating: parseFloat(value) }))}
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
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={productData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of product"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Product Image</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        {imagePreview ? (
                                            <div className="space-y-4">
                                                <img src={imagePreview} alt="Product preview" className="mx-auto h-32 w-32 object-cover rounded-md" />
                                                <Button type="button" variant="outline" onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview('');
                                                }}>
                                                    Remove image
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="flex text-sm text-gray-600">
                                                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                        <span>Upload a file</span>
                                                        <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Features</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            placeholder="Add feature"
                                        />
                                        <Button type="button" onClick={addFeature}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {productData.features.map((feature, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Tags</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add tag"
                                        />
                                        <Button type="button" onClick={addTag}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {productData.tags.map((tag, index) => (
                                            <Badge key={index} className="flex items-center gap-1">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(index)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Category-specific fields */}
                                <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                                    <h3 className="text-lg font-medium">Category Specific Details</h3>
                                    {renderCategorySpecificFields()}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Adding Product...' : 'Add Product'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}