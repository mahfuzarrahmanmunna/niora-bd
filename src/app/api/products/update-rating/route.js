// src/app/api/products/update-rating/route.js
import { NextResponse } from 'next/server';
import { updateProductRating } from '@/lib/updateProductRating';

// POST to update a product's rating
export async function POST(request) {
    try {
        const body = await request.json();
        const { productId } = body;
        
        if (!productId) {
            return NextResponse.json(
                { success: false, message: 'Product ID is required' },
                { status: 400 }
            );
        }
        
        const newRating = await updateProductRating(productId);
        
        return NextResponse.json({
            success: true,
            message: 'Product rating updated successfully',
            data: {
                productId,
                rating: newRating
            }
        });
    } catch (error) {
        console.error('Error updating product rating:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update product rating' },
            { status: 500 }
        );
    }
}