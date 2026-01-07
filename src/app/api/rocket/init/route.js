// src/app/api/rocket/init/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { orderId, amount, customerInfo } = await request.json();
    
    if (!orderId || !amount || !customerInfo) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Rocket API configuration
    const rocketConfig = {
      storeId: process.env.ROCKET_STORE_ID,
      storePassword: process.env.ROCKET_STORE_PASSWORD,
      isSandbox: process.env.ROCKET_SANDBOX === 'true',
      apiKey: process.env.ROCKET_API_KEY,
      apiVersion: 'v1'
    };

    // Generate a unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare payment request data
    const paymentData = {
      transactionId,
      orderId,
      amount: amount.toString(),
      currency: 'BDT',
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      customerAddress: {
        address: customerInfo.address,
        city: customerInfo.city,
        country: customerInfo.country
      },
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      // Additional Rocket-specific fields
      paymentOption: 'rocket',
      metadata: {
        orderId,
        source: 'web'
      }
    };

    // Generate signature (Rocket requires HMAC-SHA256 signature)
    const signature = generateRocketSignature(paymentData, rocketConfig.storePassword);

    // Make API call to Rocket
    const rocketResponse = await fetch('https://api.rocket.com.bd/v1/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-Id': rocketConfig.storeId,
        'X-API-Version': rocketConfig.apiVersion,
        'X-Signature': signature
      },
      body: JSON.stringify(paymentData)
    });

    const response = await rocketResponse.json();

    if (!response.success) {
      return NextResponse.json(
        { success: false, message: response.message || 'Rocket payment initialization failed' },
        { status: 400 }
      );
    }

    // Store transaction in database for tracking
    await saveTransaction({
      orderId,
      transactionId,
      amount,
      status: 'pending',
      paymentMethod: 'rocket',
      rocketResponse: response
    });

    return NextResponse.json({
      success: true,
      paymentUrl: response.paymentUrl,
      transactionId,
      message: 'Rocket payment initiated successfully'
    });

  } catch (error) {
    console.error('Rocket API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to generate Rocket signature
function generateRocketSignature(data, secretKey) {
  // Rocket requires HMAC-SHA256 signature
  const sortedKeys = Object.keys(data).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');
  
  return crypto
    .createHmac('sha256', secretKey)
    .update(queryString, 'utf8')
    .digest('hex');
}

// Helper function to save transaction
async function saveTransaction(transactionData) {
  // Save to your database
  // This would connect to your transactions collection
  console.log('Saving transaction:', transactionData);
  return true;
}