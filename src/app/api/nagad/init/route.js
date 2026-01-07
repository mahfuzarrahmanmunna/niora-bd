// src/app/api/nagad/init/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

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

    // Nagad configuration
    const merchant_id = process.env.NAGAD_MERCHANT_ID;
    const merchant_private_key = process.env.NAGAD_MERCHANT_PRIVATE_KEY;
    const nagad_public_key = process.env.NAGAD_PUBLIC_KEY;
    const is_sandbox = process.env.NAGAD_SANDBOX === 'true';
    
    if (!merchant_id || !merchant_private_key || !nagad_public_key) {
      console.error('Nagad credentials missing');
      return NextResponse.json(
        { success: false, message: 'Payment gateway configuration error. Nagad credentials are missing.' },
        { status: 500 }
      );
    }

    // Create transaction ID
    const order_id = `NAGAD_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Step 1: Initialize payment
    const initUrl = is_sandbox 
      ? 'https://sandbox.mynagad.com/merchant-api/api/merchant/v1.0/payment/initiate' 
      : 'https://api.mynagad.com/merchant-api/api/merchant/v1.0/payment/initiate';

    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000).toString();
    
    const sensitiveData = {
      merchantId: merchant_id,
      orderId: order_id,
      currencyCode: 'BDT',
      amount: amount,
      merchantCallbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/nagad/callback`
    };
    
    const data = {
      accountNumber: customerInfo.phone,
      dateTime: timestamp,
      random: random,
      sensitiveData: Buffer.from(JSON.stringify(sensitiveData)).toString('base64'),
      signature: crypto.createSign('SHA256')
        .update(JSON.stringify(sensitiveData))
        .sign(merchant_private_key, 'base64')
    };

    const initResponse = await fetch(initUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-KM-IP-V4': '127.0.0.1'
      },
      body: JSON.stringify(data)
    });

    const initData = await initResponse.json();
    
    if (!initData.paymentRefId) {
      console.error('Nagad payment initialization failed:', initData);
      return NextResponse.json(
        { success: false, message: initData.message || 'Payment initialization failed' },
        { status: 400 }
      );
    }

    // Step 2: Complete payment
    const completeUrl = is_sandbox 
      ? 'https://sandbox.mynagad.com/merchant-api/api/merchant/v1.0/payment/complete' 
      : 'https://api.mynagad.com/merchant-api/api/merchant/v1.0/payment/complete';

    const paymentData = {
      paymentRefId: initData.paymentRefId,
      merchantId: merchant_id,
      orderId: order_id,
      currencyCode: 'BDT',
      amount: amount,
      merchantCallbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/nagad/callback`,
      additionalMerchantInfo: {
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          address: customerInfo.address,
          city: customerInfo.city,
          country: customerInfo.country
        }
      }
    };

    const completeResponse = await fetch(completeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-KM-IP-V4': '127.0.0.1'
      },
      body: JSON.stringify(paymentData)
    });

    const completeData = await completeResponse.json();
    
    if (completeData.status === 'Success') {
      // Update the order with transaction ID
      await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            nagadTransactionId: initData.paymentRefId,
            nagadOrderId: order_id,
            paymentInfo: {
              paymentRefId: initData.paymentRefId,
              orderId: order_id,
              amount,
              currency: 'BDT',
              status: 'PENDING',
              gateway: 'Nagad'
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
        paymentUrl: completeData.callBackUrl,
        paymentRefId: initData.paymentRefId
      });
    } else {
      console.error('Nagad payment completion failed:', completeData);
      return NextResponse.json(
        { success: false, message: completeData.message || 'Payment initialization failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error initializing Nagad payment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}