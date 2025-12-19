// src/app/api/add-products/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';

// Helper function to upload images to ImgBB
async function uploadImagesToImgBB(images) {
    const apiKey = 'f2f3f75de26957d089ecdb402788644c';
    const uploadPromises = [];
    
    for (const image of images) {
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

        // Handle multiple image uploads if present
        if (productData.images && productData.images.length > 0) {
            try {
                const imageUrls = await uploadImagesToImgBB(productData.images);
                productData.imageUrls = imageUrls;
                delete productData.images; // Remove base64 data from database record
            } catch (error) {
                console.error('Error uploading images:', error);
                return NextResponse.json(
                    { success: false, message: 'Failed to upload images: ' + error.message },
                    { status: 500 }
                );
            }
        } else {
            // If no images provided, set an empty array
            productData.imageUrls = [];
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
                imageUrls: productData.imageUrls
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to add product', error: error.message },
            { status: 500 }
        );
    }
}