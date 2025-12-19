// /src/app/api/products/[id]/route.js
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
        
        // Return URL for the uploaded image
        return `/uploads/products/${fileName}`;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// GET a single product by ID
export async function GET(request, { params }) {
    try {
        const { id } = params;
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
            { success: false, message: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// UPDATE a product by ID
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const collection = await dbConnect('products');
        
        // Check if product exists
        let product;
        
        // Check if ID is a valid MongoDB ObjectId
        if (ObjectId.isValid(id)) {
            product = await collection.findOne({ _id: new ObjectId(id) });
        } else {
            // If not, try to find by custom 'id' field
            product = await collection.findOne({ id: id });
        }

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Parse the request data
        let updateData;
        const contentType = request.headers.get('content-type');
        
        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle FormData (when file is uploaded)
            const formData = await request.formData();
            updateData = {};
            
            // Extract all fields from FormData
            for (const [key, value] of formData.entries()) {
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
                    // Parse array fields from JSON strings
                    try {
                        updateData[key] = JSON.parse(value);
                    } catch (e) {
                        // If parsing fails, treat as comma-separated values
                        updateData[key] = value.split(',').map(item => item.trim()).filter(Boolean);
                    }
                } else {
                    // Handle regular fields
                    updateData[key] = value;
                }
            }
        } else {
            // Handle JSON data (when no file is uploaded)
            updateData = await request.json();
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

        // Update product
        let result;

        // Check if ID is a valid MongoDB ObjectId
        if (ObjectId.isValid(id)) {
            result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
        } else {
            // If not, try to update by custom 'id' field
            result = await collection.updateOne(
                { id: id },
                { $set: updateData }
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