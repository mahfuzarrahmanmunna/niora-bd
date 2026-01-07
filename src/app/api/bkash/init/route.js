// src/app/api/bkash/init/route.js
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

    // bKash configuration
    const app_key = process.env.BKASH_APP_KEY;
    const app_secret = process.env.BKASH_APP_SECRET;
    const username = process.env.BKASH_USERNAME;
    const password = process.env.BKASH_PASSWORD;
    const is_sandbox = process.env.BKASH_SANDBOX === 'true';
    
    if (!app_key || !app_secret || !username || !password) {
      console.error('bKash credentials missing');
      return NextResponse.json(
        { success: false, message: 'Payment gateway configuration error. bKash credentials are missing.' },
        { status: 500 }
      );
    }

    // Create transaction ID
    const merchantInvoiceNumber = `Inv_${Date.now()}`;
    
    // Step 1: Get grant token
    const tokenUrl = is_sandbox 
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant' 
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant';

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'username': username,
        'password': password
      },
      body: JSON.stringify({
        app_key: app_key,
        app_secret: app_secret
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.id_token) {
      console.error('Failed to get bKash token:', tokenData);
      return NextResponse.json(
        { success: false, message: 'Failed to authenticate with bKash' },
        { status: 500 }
      );
    }

    // Step 2: Create payment
    const paymentUrl = is_sandbox 
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create' 
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create';

    const paymentData = {
      mode: '0011',
      payerReference: customerInfo.phone,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/bkash/callback`,
      amount: amount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: merchantInvoiceNumber
    };

    const paymentResponse = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': tokenData.id_token,
        'X-APP-Key': app_key
      },
      body: JSON.stringify(paymentData)
    });

    const paymentResult = await paymentResponse.json();
    
    if (paymentResult.paymentID) {
      // Update the order with transaction ID
      await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            bkashTransactionId: paymentResult.paymentID,
            bkashMerchantInvoiceNumber: merchantInvoiceNumber,
            paymentInfo: {
              paymentID: paymentResult.paymentID,
              amount,
              currency: 'BDT',
              status: 'PENDING',
              gateway: 'bKash'
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
        paymentUrl: paymentResult.bkashURL,
        paymentID: paymentResult.paymentID
      });
    } else {
      console.error('bKash payment creation failed:', paymentResult);
      return NextResponse.json(
        { success: false, message: paymentResult.statusMessage || 'Payment initialization failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error initializing bKash payment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}