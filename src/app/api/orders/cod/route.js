// src/app/api/manage-my-order/cod/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { orderId, customerInfo } = await request.json();
    
    if (!orderId || !customerInfo) {
      return NextResponse.json(
        { success: false, message: 'Order ID and customer information are required' },
        { status: 400 }
      );
    }

    // Get order details to verify
    const ordersCollection = await dbConnect('orders');
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order with COD payment info
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          paymentInfo: {
            method: 'COD',
            amount: order.totalPrice,
            currency: 'BDT',
            status: 'PENDING',
            gateway: 'Cash on Delivery'
          },
          shippingAddress: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
            city: customerInfo.city,
            country: customerInfo.country
          },
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Cash on delivery order confirmed'
    });
  } catch (error) {
    console.error('Error processing COD order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}