// src/app/api/rocket/init/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { orderId, amount, customerInfo } = await request.json();
    
    if (!orderId || !amount || !customerInfo) {
      return NextResponse.json(
        { success: false, message: 'Order ID, amount, and customer information are required' },
        { status: 400 }
      );
    }

    // For now, we'll just return a success response
    // In a real implementation, you would integrate with Rocket API
    return NextResponse.json({
      success: true,
      paymentUrl: `https://rocket.com/payment?orderId=${orderId}&amount=${amount}`,
      message: 'Rocket payment initiated'
    });
  } catch (error) {
    console.error('Error in Rocket API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}