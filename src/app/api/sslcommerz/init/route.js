// src/app/api/sslcommerz/init/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { orderId, amount, customerInfo } = await request.json();
    
    if (!orderId || !amount || !customerInfo) {
      return NextResponse.json(
        { success: false, message: 'Order ID, amount, and customer information are required' },
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

    // SSLCommerz configuration
    const store_id = process.env.SSLCOMMERZ_STORE_ID;
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const is_sandbox = process.env.SSLCOMMERZ_SANDBOX === 'true';
    
    // More detailed error checking
    if (!store_id || store_id === 'your_store_id') {
      console.error('Invalid SSLCommerz store_id:', store_id);
      return NextResponse.json(
        { success: false, message: 'Invalid SSLCommerz store ID. Please check your environment variables.' },
        { status: 500 }
      );
    }
    
    if (!store_passwd || store_passwd === 'your_store_password') {
      console.error('Invalid SSLCommerz store_passwd');
      return NextResponse.json(
        { success: false, message: 'Invalid SSLCommerz store password. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // Create transaction ID
    const tran_id = `SSLCZ_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Prepare payment data
    const paymentData = {
      store_id,
      store_passwd,
      total_amount: amount.toString(),
      currency: 'BDT',
      tran_id,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sslcommerz/success`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sslcommerz/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sslcommerz/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/sslcommerz/ipn`,
      shipping_method: 'NO',
      product_name: 'Order Payment',
      product_category: 'E-commerce',
      product_profile: 'general',
      cus_name: customerInfo.name,
      cus_email: customerInfo.email,
      cus_add1: customerInfo.address,
      cus_city: customerInfo.city,
      cus_country: customerInfo.country,
      cus_phone: customerInfo.phone,
      multi_card_name: '',
      value_a: orderId,
      value_b: 'payment',
      value_c: '',
      value_d: ''
    };

    // Make the API request to SSLCommerz
    const sslczUrl = is_sandbox 
      ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php' 
      : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

    console.log('Making SSLCommerz request to:', sslczUrl);
    console.log('With store_id:', store_id);

    const response = await fetch(sslczUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paymentData).toString(),
    });

    const responseText = await response.text();
    console.log('SSLCommerz response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse SSLCommerz response:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid response from payment gateway' },
        { status: 500 }
      );
    }

    if (data.status === 'SUCCESS') {
      // Update the order with transaction ID
      await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            sslcommerzTransactionId: tran_id, // Add this field for tracking
            paymentInfo: {
              tran_id,
              amount,
              currency: 'BDT',
              status: 'PENDING'
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
        paymentUrl: data.GatewayPageURL,
        tran_id
      });
    } else {
      // Provide more specific error messages based on SSLCommerz error codes
      let errorMessage = data.failedreason || 'Payment initialization failed';
      
      if (errorMessage.includes('Store Credential Error') || errorMessage.includes('Store is De-active')) {
        errorMessage = 'SSLCommerz store credentials are invalid or the store is inactive. Please check your SSLCommerz account or use a different payment method.';
      }
      
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error initializing SSLCommerz payment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}