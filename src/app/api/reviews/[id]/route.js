// src/app/api/reviews/[id]/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// GET a specific review
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const collection = await dbConnect('reviews');
        
        const review = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!review) {
            return NextResponse.json(
                { success: false, message: 'Review not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error fetching review:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch review' },
            { status: 500 }
        );
    }
}

// PUT (update) a specific review
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, rating, title, comment, profileImage, verified } = body;
        
        const collection = await dbConnect('reviews');
        
        // Check if review exists
        const existingReview = await collection.findOne({ _id: new ObjectId(id) });
        if (!existingReview) {
            return NextResponse.json(
                { success: false, message: 'Review not found' },
                { status: 404 }
            );
        }
        
        // Prepare update data
        const updateData = {
            updatedAt: new Date()
        };
        
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return NextResponse.json(
                    { success: false, message: 'Rating must be between 1 and 5' },
                    { status: 400 }
                );
            }
            updateData.rating = parseFloat(rating);
        }
        if (title !== undefined) updateData.title = title;
        if (comment !== undefined) updateData.comment = comment;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (verified !== undefined) updateData.verified = verified;
        
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        return NextResponse.json({
            success: true,
            message: 'Review updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update review' },
            { status: 500 }
        );
    }
}

// DELETE a specific review
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const collection = await dbConnect('reviews');
        
        // Check if review exists
        const existingReview = await collection.findOne({ _id: new ObjectId(id) });
        if (!existingReview) {
            return NextResponse.json(
                { success: false, message: 'Review not found' },
                { status: 404 }
            );
        }
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        
        return NextResponse.json({
            success: true,
            message: 'Review deleted successfully',
            data: result
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete review' },
            { status: 500 }
        );
    }
}