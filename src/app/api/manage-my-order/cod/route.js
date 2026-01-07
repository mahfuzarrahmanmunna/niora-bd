// app/api/manage-my-order/cod/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { orderId, customerInfo } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const ordersCollection = await dbConnect('orders');
    
    // Check if the order exists
    let order;
    try {
      // Try to find by ObjectId first
      if (ObjectId.isValid(orderId)) {
        order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
      }
      
      // If not found, try to find by string ID field
      if (!order) {
        order = await ordersCollection.findOne({ id: orderId });
      }
    } catch (error) {
      console.error('Error finding order:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order with customer info and COD payment method
    const result = await ordersCollection.updateOne(
      { _id: order._id },
      { 
        $set: { 
          paymentMethod: 'cod',
          shippingAddress: customerInfo,
          status: 'confirmed',
          paymentStatus: 'pending',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order confirmed with Cash on Delivery',
      orderId: orderId
    });
  } catch (error) {
    console.error('Error processing COD order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process order', error: error.message },
      { status: 500 }
    );
  }
}