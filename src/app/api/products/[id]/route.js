// src/app/api/products/[id]/route.js

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Helper function to handle image upload
async function handleImageUpload(imageFile, productId) {
    try {
        if (!imageFile) return null;
        
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        await mkdir(uploadDir, { recursive: true });
        
        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `${productId}_${timestamp}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        
        // Convert file to buffer
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Write file to filesystem
        await writeFile(filePath, buffer);
        
        // Return URL for uploaded image
        return `/uploads/products/${fileName}`;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// GET a single product by ID
export async function GET(request, { params }) {
    try {
        // Await params object to get id
        const { id } = await params;
        console.log('GET request received for product ID:', id);
        
        const collection = await dbConnect('products');
        
        // Find product by ID
        let product;
        
        // Check if ID is a valid MongoDB ObjectId
        if (ObjectId.isValid(id)) {
            product = await collection.findOne({ _id: new ObjectId(id) });
        } else {
            // If not, try to find by custom 'id' field
            product = await collection.findOne({ id: id });
        }

        if (!product) {
            console.log('Product not found with ID:', id);
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch product: ' + error.message },
            { status: 500 }
        );
    }
}

// UPDATE a product by ID
export async function PUT(request, { params }) {
    try {
        // Await params object to get id
        const { id } = await params;
        console.log('PUT request received for product ID:', id);
        
        const collection = await dbConnect('products');
        
        // Check if product exists
        let product;
        let query;
        
        // Check if ID is a valid MongoDB ObjectId
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
            product = await collection.findOne(query);
        } else {
            // If not, try to find by custom 'id' field
            query = { id: id };
            product = await collection.findOne(query);
        }

        if (!product) {
            console.log('Product not found with ID:', id);
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Parse the request data
        let updateData = {};
        const contentType = request.headers.get('content-type');
        
        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle FormData (when file is uploaded)
            const formData = await request.formData();
            
            // Extract all fields from FormData
            for (const [key, value] of formData.entries()) {
                // Skip the _id field as it's immutable
                if (key === '_id') {
                    continue;
                }
                
                if (key === 'image') {
                    // Handle image file
                    try {
                        const imageUrl = await handleImageUpload(value, id);
                        updateData.imageUrl = imageUrl;
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        return NextResponse.json(
                            { success: false, message: 'Failed to upload image: ' + error.message },
                            { status: 500 }
                        );
                    }
                } else if (key === 'sizes' || key === 'tags' || key === 'features') {
                    // Parse array fields from comma-separated strings
                    updateData[key] = value.split(',').map(item => item.trim()).filter(Boolean);
                } else if (key === 'price' || key === 'discount' || key === 'finalPrice' || key === 'stock' || key === 'rating') {
                    // Convert numeric fields to numbers
                    updateData[key] = parseFloat(value) || 0;
                } else {
                    // Handle regular fields
                    updateData[key] = value;
                }
            }
        } else {
            // Handle JSON data (when no file is uploaded)
            const jsonData = await request.json();
            
            // Create a clean update object without the _id field
            updateData = { ...jsonData };
            delete updateData._id; // Remove the immutable _id field
        }

        // Validate required fields
        if (!updateData.name || !updateData.brand || !updateData.category || !updateData.price) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: name, brand, category, or price' },
                { status: 400 }
            );
        }

        // Add updated timestamp
        updateData.updatedAt = new Date();

        console.log('Update data:', updateData);

        // Update product
        const result = await collection.updateOne(
            query,
            { $set: updateData }
        );

        console.log('Update result:', result);

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Product not found or no changes made' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully',
            data: result
        });
    } catch (error) { 
        console.error('Error updating product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update product: ' + error.message },
            { status: 500 }
        );
    }
}

// DELETE a product by ID
export async function DELETE(request, { params }) {
    try {
        // Await params object to get id
        const { id } = await params;
        console.log('DELETE request received for product ID:', id);
        
        // Connect to the database
        const collection = await dbConnect('products');
        
        // Check if product exists
        let product;
        let query;
        
        // Check if ID is a valid MongoDB ObjectId
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
            product = await collection.findOne(query);
        } else {
            // If not, try to find by custom 'id' field
            query = { id: id };
            product = await collection.findOne(query);
        }

        if (!product) {
            console.log('Product not found with ID:', id);
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Delete product
        const result = await collection.deleteOne(query);

        console.log('Delete result:', result);

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Product not found or already deleted' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
            data: result
        });
    } catch (error) { 
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete product: ' + error.message },
            { status: 500 }
        );
    }
}