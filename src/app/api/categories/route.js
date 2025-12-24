// /src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(request) {
    try {
        const collection = await dbConnect('categories');
        
        // Parse query parameters for pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search');
        
        // Build query object
        const query = {};
        
        // Add search filter if provided
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Count total documents for pagination info
        const total = await collection.countDocuments(query);
        
        // Fetch categories with pagination and product count
        const categories = await collection.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'name',
                    foreignField: 'category',
                    as: 'categoryProducts'
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    imageUrl: 1,
                    'categoryProducts': { $size: 1 }
                }
            },
            {
                $addFields: {
                    productCount: { $size: '$categoryProducts' }
                }
            }
        ])
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }) // Sort by newest first
        .toArray();
        
        return NextResponse.json({
            success: true,
            data: categories.map(cat => ({
                ...cat,
                productCount: cat.productCount || 0
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}