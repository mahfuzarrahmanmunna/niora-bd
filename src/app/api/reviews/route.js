// src/app/api/reviews/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';
import { uploadToImgBB } from '@/lib/imgbb';
import { updateProductRating } from '@/lib/updateProductRating';

// GET all reviews or reviews for a specific product
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        
        const collection = await dbConnect('reviews');
        
        let query = {};
        if (productId) {
            query.productId = productId;
        }
        
        const reviews = await collection.find(query).sort({ createdAt: -1 }).toArray();
        
        return NextResponse.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// POST a new review
export async function POST(request) {
    try {
        const body = await request.json();
        const { productId, name, email, rating, title, comment, profileImage } = body;
        
        // Validate required fields
        if (!productId || !name || !email || !rating || !title || !comment) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }
        
        // Validate rating
        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }
        
        const collection = await dbConnect('reviews');
        
        // Handle profile image upload to ImgBB
        let profileImageUrl = '/placeholder-avatar.png'; // Default image
        
        if (profileImage && profileImage !== '/placeholder-avatar.png') {
            try {
                // Upload image to ImgBB
                profileImageUrl = await uploadToImgBB(profileImage);
            } catch (uploadError) {
                console.error('Error uploading profile image:', uploadError);
                // Continue with default image if upload fails
                profileImageUrl = '/placeholder-avatar.png';
            }
        }
        
        const newReview = {
            productId,
            name,
            email,
            rating: parseFloat(rating),
            title,
            comment,
            profileImage: profileImageUrl,
            verified: false, // Default to false, can be updated later
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await collection.insertOne(newReview);
        
        // Update the product's average rating
        try {
            await updateProductRating(productId);
        } catch (ratingError) {
            console.error('Error updating product rating:', ratingError);
            // Continue with the response even if rating update fails
        }
        
        return NextResponse.json({
            success: true,
            message: 'Review submitted successfully',
            data: {
                ...newReview,
                _id: result.insertedId
            }
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to submit review' },
            { status: 500 }
        );
    }
}