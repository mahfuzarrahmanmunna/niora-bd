// app/api/manage-my-order/[id]/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// GET a single order by ID
export async function GET(request, { params }) {
    try {
        // In Next.js 13+, params is a Promise and needs to be awaited
        const { id } = await params;
        
        console.log('=== DEBUG: Fetching order ===');
        console.log('Received ID:', id);
        console.log('ID type:', typeof id);
        console.log('ID length:', id?.length);
        console.log('Is valid ObjectId:', ObjectId.isValid(id));
        
        if (!id) {
            console.log('ERROR: No ID provided');
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            );
        }

        const collection = await dbConnect('orders');
        let order = null;

        // Method 1: Try to find by ObjectId
        try {
            if (ObjectId.isValid(id)) {
                console.log('Trying ObjectId lookup...');
                order = await collection.findOne({ _id: new ObjectId(id) });
                console.log('ObjectId lookup result:', order);
            }
        } catch (error) {
            console.log('ObjectId lookup failed:', error.message);
        }

        // Method 2: Try to find by string ID field
        if (!order) {
            console.log('Trying string ID lookup...');
            order = await collection.findOne({ id: id });
            console.log('String ID lookup result:', order);
        }

        // Method 3: Try to find by any field that might contain the ID
        if (!order) {
            console.log('Trying generic lookup...');
            order = await collection.findOne({
                $or: [
                    { _id: id },
                    { id: id },
                    { orderId: id },
                    { transactionId: id }
                ]
            });
            console.log('Generic lookup result:', order);
        }

        // Method 4: If still not found, try converting to ObjectId and search again
        if (!order) {
            try {
                console.log('Trying forced ObjectId conversion...');
                const objectId = new ObjectId(id);
                order = await collection.findOne({ _id: objectId });
                console.log('Forced ObjectId lookup result:', order);
            } catch (error) {
                console.log('Forced ObjectId conversion failed:', error.message);
            }
        }

        if (!order) {
            console.log('ERROR: Order not found with any method');
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        console.log('SUCCESS: Order found:', order._id);
        return NextResponse.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('=== ERROR IN API ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch order', error: error.message },
            { status: 500 }
        );
    }
}