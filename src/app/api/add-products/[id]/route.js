// src/app/api/add-products/[id]/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// GET a single product by ID
export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Connect to database
        const collection = await dbConnect('products');

        // Find the product by ID
        const product;

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

        return NextResponse.json(
            { success: true, data: product },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch product', error: error.message },
            { status: 500 }
        );
    }
}

// UPDATE a product by ID
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const updateData = await request.json();

        // Connect to database
        const collection = await dbConnect('products');

        // Add updated timestamp
        updateData.updatedAt = new Date();

        // Handle multiple images if present
        if (updateData.images && updateData.images.length > 0) {
            // Upload new images to ImgBB
            try {
                const apiKey = 'f2f3f75de26957d089ecdb402788644c';
                const uploadPromises = [];
                
                for (const image of updateData.images) {
                    // Convert base64 to FormData for ImgBB API
                    const formData = new FormData();
                    
                    // Remove the data:image/...;base64, prefix if present
                    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
                    formData.append('key', apiKey);
                    formData.append('image', base64Data);
                    
                    const uploadPromise = fetch('https://api.imgbb.com/1/upload', {
                        method: 'POST',
                        body: formData
                    }).then(response => response.json());
                    
                    uploadPromises.push(uploadPromise);
                }
                
                const results = await Promise.all(uploadPromises);
                const imageUrls = results.map(result => {
                    if (result.success) {
                        return result.data.url;
                    } else {
                        throw new Error(result.error?.message || 'Upload failed');
                    }
                });
                
                updateData.imageUrls = imageUrls;
                delete updateData.images; // Remove base64 data from database record
            } catch (error) {
                console.error('Error uploading images:', error);
                return NextResponse.json(
                    { success: false, message: 'Failed to upload images: ' + error.message },
                    { status: 500 }
                );
            }
        }

        // Update the product
        const result;

        // Check if the ID is a valid MongoDB ObjectId
        if (ObjectId.isValid(id)) {
            result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
        } else {
            // If not, try to update by the custom 'id' field
            result = await collection.updateOne(
                { id: id },
                { $set: updateData }
            );
        }

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Product updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update product', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE a product by ID
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Connect to the database
        const collection = await dbConnect('products');

        // Delete the product
        const result;

        // Check if the ID is a valid MongoDB ObjectId
        if (ObjectId.isValid(id)) {
            result = await collection.deleteOne({ _id: new ObjectId(id) });
        } else {
            // If not, try to delete by the custom 'id' field
            result = await collection.deleteOne({ id: id });
        }

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Product deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete product', error: error.message },
            { status: 500 }
        );
    }
}