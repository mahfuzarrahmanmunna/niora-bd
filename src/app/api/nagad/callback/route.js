// src/app/api/nagad/callback/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { paymentRefId, order_id, status, amount } = await request.json();
    
    if (!paymentRefId || !status) {
      return NextResponse.redirect(new URL('/payment/fail', request.url));
    }

    if (status === 'Success') {
      const ordersCollection = await dbConnect('orders');
      
      // Find the order using the payment reference ID we stored during initiation
      const order = await ordersCollection.findOne({ nagadTransactionId: paymentRefId });

      if (order) {
        // Update product stock
        const productsCollection = await dbConnect('products');
        for (const item of order.items) {
          await productsCollection.updateOne(
            { id: item.productId },
            { $inc: { stock: -item.quantity } }
          );
        }

        await ordersCollection.updateOne(
          { _id: order._id },
          { 
            $set: { 
              status: 'paid',
              paymentDetails: {
                gateway: 'Nagad',
                paymentRefId: paymentRefId,
                orderId: order_id,
                amount: amount,
                paidAt: new Date(),
              },
              updatedAt: new Date()
            }
          }
        );
        
        // Clear the user's cart after successful payment
        const userId = order.userId;
        if (userId) {
          const cartCollection = await dbConnect('cart');
          await cartCollection.deleteMany({ userId });
        }

        // Redirect to the frontend success page
        const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?orderId=${order._id}`;
        return NextResponse.redirect(successUrl);
      }
    }
    
    // If status is not success or order not found, redirect to fail page
    return NextResponse.redirect(new URL('/payment/fail', request.url));
  } catch (error) {
    console.error('Nagad Callback Error:', error);
    return NextResponse.redirect(new URL('/payment/fail', request.url));
  }
}