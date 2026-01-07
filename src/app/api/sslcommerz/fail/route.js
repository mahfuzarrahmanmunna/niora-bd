// src/app/api/sslcommerz/fail/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const data = await request.formData();
    const tran_id = data.get('tran_id');
    const status = data.get('status'); // 'FAILED'

    if (tran_id) {
      const ordersCollection = await dbConnect('orders');
      const order = await ordersCollection.findOne({ sslcommerzTransactionId: tran_id });

      if (order) {
        await ordersCollection.updateOne(
          { _id: order._id },
          { 
            $set: { 
              status: 'failed',
              paymentDetails: {
                gateway: 'SSLCommerz',
                transactionId: tran_id,
                status: status,
                failedAt: new Date(),
              },
              updatedAt: new Date()
            }
          }
        );
      }
    }
    
    // Redirect to the frontend fail page
    return NextResponse.redirect(new URL('/payment/fail', request.url));

  } catch (error) {
    console.error('SSLCommerz Fail Callback Error:', error);
    return NextResponse.redirect(new URL('/payment/fail', request.url));
  }
}