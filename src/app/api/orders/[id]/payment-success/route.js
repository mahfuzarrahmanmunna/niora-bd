// src/app/api/manage-my-order/[orderId]/payment-success/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export async function POST(request, { params }) {
  try {
    const { orderId } = params;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const ordersCollection = await dbConnect('orders');
    
    // Update order status to "paid" or "processing"
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status: 'paid',
          paymentInfo: {
            status: 'COMPLETED',
            paidAt: new Date()
          },
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order updated'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}