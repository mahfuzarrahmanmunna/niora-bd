import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const tran_id = formData.get('tran_id');
    const val_id = formData.get('val_id'); // Validation ID
    const amount = formData.get('amount');
    const status = formData.get('status'); // Should be 'VALID' or 'VALIDATED'

    if (!tran_id || !status) {
      // If we don't have the required data, just redirect to fail page
      return NextResponse.redirect(new URL('/payment/fail', request.url));
    }

    // In a real application, you should validate the transaction using `val_id`
    // by calling the SSLCommerz validation API. For simplicity, we're skipping it here.
    // https://developer.sslcommerz.com/doc/v4/#validation-apis

    if (status === 'VALID' || status === 'VALIDATED') {
      const ordersCollection = await dbConnect('orders');
      
      // Find the order using the transaction ID we stored during initiation
      const order = await ordersCollection.findOne({ sslcommerzTransactionId: tran_id });

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
                gateway: 'SSLCommerz',
                transactionId: tran_id,
                validationId: val_id,
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
    
    // If status is not valid or order not found, redirect to fail page
    return NextResponse.redirect(new URL('/payment/fail', request.url));
  } catch (error) {
    console.error('SSLCommerz Success Callback Error:', error);
    return NextResponse.redirect(new URL('/payment/fail', request.url));
  }
}