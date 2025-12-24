// src/app/api/orders/cod/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// THIS IS THE CORRECT NAMED EXPORT FOR THE POST METHOD
export async function POST(request) {
    console.log("--- COD API POST Request Started ---");
    try {
        const { orderId, customerInfo } = await request.json();
        
        if (!orderId || !customerInfo) {
            return NextResponse.json(
                { success: false, message: 'Order ID and customer information are required' },
                { status: 400 }
            );
        }

        const ordersCollection = await dbConnect('orders');
        
        let order;
        try {
            order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
        } catch (idError) {
            return NextResponse.json(
                { success: false, message: 'Invalid Order ID format.' },
                { status: 400 }
            );
        }

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        const updatePayload = {
            paymentMethod: 'cash_on_delivery',
            paymentInfo: { status: 'PENDING', method: 'cash_on_delivery' },
            shippingAddress: {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                city: customerInfo.city,
                country: customerInfo.country
            },
            status: 'processing',
            updatedAt: new Date()
        };

        const updateResult = await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            { $set: updatePayload }
        );

        if (updateResult.matchedCount === 0) {
             return NextResponse.json(
                { success: false, message: 'Failed to update order.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Cash on delivery order confirmed'
        });

    } catch (error) {
        console.error('COD API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}