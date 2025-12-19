// /src/app/api/add-products/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
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

export async function POST(request) {
    try {
        const productData = await request.json();

        // Validate required fields
        if (!productData.name || !productData.brand || !productData.category || !productData.price) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: name, brand, category, or price' },
                { status: 400 }
            );
        }

        // Generate ID if not provided
        if (!productData.id) {
            const categoryId = productData.category.substring(0, 3).toUpperCase();
            const randomId = Math.floor(1000 + Math.random() * 9000);
            productData.id = `${categoryId}${randomId}`;
        }

        // Add timestamps
        productData.createdAt = new Date();
        productData.updatedAt = new Date();

        // Handle image upload if present
        if (productData.imageFile) {
            try {
                const imageUrl = await handleImageUpload(productData.imageFile, productData.id);
                productData.imageUrl = imageUrl;
                delete productData.imageFile; // Remove the file data from the database record
            } catch (error) {
                console.error('Error uploading image:', error);
                return NextResponse.json(
                    { success: false, message: 'Failed to upload image: ' + error.message },
                    { status: 500 }
                );
            }
        }

        // Convert string values to appropriate types
        const processedData = {
            ...productData,
            price: parseFloat(productData.price),
            discount: parseFloat(productData.discount) || 0,
            finalPrice: parseFloat(productData.finalPrice),
            stock: parseInt(productData.stock),
            rating: parseFloat(productData.rating)
        };

        const collection = await dbConnect('products');
        const result = await collection.insertOne(processedData);

        return NextResponse.json({
            success: true,
            message: 'Product added successfully',
            data: {
                _id: result.insertedId,
                id: productData.id,
                name: productData.name,
                imageUrl: productData.imageUrl
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to add product' },
            { status: 500 }
        );
    }
}