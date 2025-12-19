// src/app/api/reviews/stats/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// GET review statistics for a product
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        
        if (!productId) {
            return NextResponse.json(
                { success: false, message: 'Product ID is required' },
                { status: 400 }
            );
        }
        
        const collection = await dbConnect('reviews');
        
        // Get all reviews for the product
        const reviews = await collection.find({ productId }).toArray();
        
        if (reviews.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: {
                        5: 0,
                        4: 0,
                        3: 0,
                        2: 0,
                        1: 0
                    }
                }
            });
        }
        
        // Calculate statistics
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
        
        // Calculate rating distribution
        const ratingDistribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };
        
        reviews.forEach(review => {
            const rating = Math.floor(review.rating);
            if (rating >= 1 && rating <= 5) {
                ratingDistribution[rating]++;
            }
        });
        
        return NextResponse.json({
            success: true,
            data: {
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews,
                ratingDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching review statistics:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch review statistics' },
            { status: 500 }
        );
    }
}