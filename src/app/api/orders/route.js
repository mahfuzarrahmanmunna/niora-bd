// src/app/api/orders/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

// GET orders by userId
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const ordersCollection = await dbConnect("orders");

    let orders = [];
    if (userId) {
      orders = await ordersCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
    }

    const ordersWithId = orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: ordersWithId,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create new order
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, items } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const ordersCollection = await dbConnect("orders");

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const productsCollection = await dbConnect("products");
      let product = null;

      try {
        product = await productsCollection.findOne({ _id: item.productId });
        if (!product) {
          product = await productsCollection.findOne({ id: item.productId });
        }
      } catch (e) {
        product = await productsCollection.findOne({ id: item.productId });
      }

      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.productId} not found` },
          { status: 404 },
        );
      }

      const itemPrice = product.finalPrice || product.price || 0;
      totalPrice += itemPrice * item.quantity;

      orderItems.push({
        productId: product._id?.toString() || product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
      });
    }

    const newOrder = {
      userId,
      items: orderItems,
      totalPrice,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(newOrder);

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
      data: { ...newOrder, _id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 },
    );
  }
}
