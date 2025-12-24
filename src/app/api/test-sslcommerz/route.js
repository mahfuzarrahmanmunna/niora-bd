import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Log all the form data to see what's being sent
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    console.log('SSLCommerz callback data:', data);
    
    // Return the data as JSON for debugging
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing SSLCommerz callback:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}