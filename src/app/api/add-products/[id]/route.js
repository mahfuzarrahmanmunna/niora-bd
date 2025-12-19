// src/app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// GET a single product by ID
export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Connect to the database
        const collection = await dbConnect('products');

        // Find the product by ID
        let product;

        // Check if the ID is a valid MongoDB ObjectId
        if (ObjectId.isValid(id)) {
            product = await collection.findOne({ _id: new ObjectId(id) });
        } else {
            // If not, try to find by the custom 'id' field
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

        // Connect to the database
        const collection = await dbConnect('products');

        // Add updated timestamp
        updateData.updatedAt = new Date();

        // Handle image file if present
        if (updateData.imageFile) {
            // In a real implementation, you would upload to a cloud storage service
            updateData.imageUrl = `https://example.com/images/${id}.jpg`;
            delete updateData.imageFile; // Remove the file data from the database record
        }

        // Update the product
        let result;

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
        let result;

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