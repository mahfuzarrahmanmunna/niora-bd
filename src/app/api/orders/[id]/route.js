import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// GET a single order by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params; // Get the dynamic ID from the URL

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid order ID format' },
                { status: 400 }
            );
        }

        const collection = await dbConnect('orders');
        const order = await collection.findOne({ _id: new ObjectId(id) });

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch order', error: error.message },
            { status: 500 }
        );
    }
}