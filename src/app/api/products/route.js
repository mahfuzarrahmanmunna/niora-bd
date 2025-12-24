// /src/app/api/products/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(request) {
    try {
        const collection = await dbConnect('products');

        // Parse query parameters for pagination, filtering, and sorting
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build query object
        const query = {};

        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = category;
        }

        // Add search filter if provided
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        try {
            // Count total documents for pagination info
            const total = await collection.countDocuments(query);

            // Fetch products with pagination and sorting
            const products = await collection
                .find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort(sort)
                .toArray();

            return NextResponse.json({
                success: true,
                data: products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch products: ' + error.message },
                { status: 500 }
            );
        }
    }
    catch (err) {
        console.log(err)
    }
}