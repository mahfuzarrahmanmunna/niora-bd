// app/api/manage-my-order/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

// POST - Create a new order
export async function POST(request) {
  try {
    console.log("API HIT: /api/manage-my-order POST request");
    
    const body = await request.json();
    const { userId, items } = body;
    
    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const ordersCollection = await dbConnect('orders');
    
    // Calculate total price
    let totalPrice = 0;
    const orderItems = [];
    
    // For each item, get product details
    for (const item of items) {
      console.log("Processing item:", item);
      console.log("Product ID:", item.productId);
      
      // Get product from database
      const productsCollection = await dbConnect('products');
      let product;
      
      try {
        // Try to convert to ObjectId if it's a valid string
        if (typeof item.productId === 'string' && ObjectId.isValid(item.productId)) {
          product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });
        }
        
        // If not found, try with the id field instead of _id
        if (!product) {
          product = await productsCollection.findOne({ id: item.productId });
        }
        
        // If still not found, try to convert string ID to ObjectId and search again
        if (!product && typeof item.productId === 'string') {
          try {
            // Remove any potential whitespace
            const cleanId = item.productId.trim();
            product = await productsCollection.findOne({ _id: new ObjectId(cleanId) });
          } catch (e) {
            console.log("Could not convert to ObjectId:", e);
          }
        }
      } catch (error) {
        console.error("Error finding product:", error);
        return NextResponse.json(
          { success: false, message: `Invalid product ID format: ${item.productId}` },
          { status: 400 }
        );
      }
      
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product with ID ${item.productId} not found` },
          { status: 404 }
        );
      }
      
      const itemPrice = product.finalPrice || product.price;
      totalPrice += itemPrice * item.quantity;
      
      orderItems.push({
        productId: product._id ? product._id.toString() : product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        imageUrl: product.imageUrl
      });
    }
    
    // Create the order
    const newOrder = {
      userId,
      items: orderItems,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the order
    const result = await ordersCollection.insertOne(newOrder);
    
    // Return the created order with its ID
    return NextResponse.json({
      success: true,
      data: {
        ...newOrder,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order', error: error.message },
      { status: 500 }
    );
  }
}