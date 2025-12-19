// src/app/api/reviews/verify/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// POST to verify a review (admin only)
export async function POST(request) {
    try {
        const body = await request.json();
        const { reviewId, verified } = body;
        
        if (!reviewId || verified === undefined) {
            return NextResponse.json(
                { success: false, message: 'Review ID and verified status are required' },
                { status: 400 }
            );
        }
        
        // In a real app, you would check if the user is an admin here
        // For now, we'll skip the admin check
        
        const collection = await dbConnect('reviews');
        
        const result = await collection.updateOne(
            { _id: new ObjectId(reviewId) },
            { 
                $set: { 
                    verified: Boolean(verified),
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Review not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: `Review ${verified ? 'verified' : 'unverified'} successfully`,
            data: result
        });
    } catch (error) {
        console.error('Error verifying review:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update review verification' },
            { status: 500 }
        );
    }
}