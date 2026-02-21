// src/app/api/manage-my-order/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// GET - Fetch all orders or by userId query
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const ordersCollection = await dbConnect("orders");

    let orders;
    if (userId) {
      orders = await ordersCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
    } else {
      orders = await ordersCollection
        .find({})
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

// POST - Create a new order
export async function POST(request) {
  try {
    console.log("API HIT: /api/manage-my-order POST request");

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
      console.log("Processing item:", item);

      const productsCollection = await dbConnect("products");
      let product;

      try {
        if (
          typeof item.productId === "string" &&
          ObjectId.isValid(item.productId)
        ) {
          product = await productsCollection.findOne({
            _id: new ObjectId(item.productId),
          });
        }

        if (!product) {
          product = await productsCollection.findOne({ id: item.productId });
        }
      } catch (error) {
        console.error("Error finding product:", error);
        return NextResponse.json(
          {
            success: false,
            message: `Invalid product ID format: ${item.productId}`,
          },
          { status: 400 },
        );
      }

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product with ID ${item.productId} not found`,
          },
          { status: 404 },
        );
      }

      const itemPrice = product.finalPrice || product.price;
      totalPrice += itemPrice * item.quantity;

      orderItems.push({
        productId: product._id ? product._id.toString() : product.id,
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
      data: {
        ...newOrder,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
