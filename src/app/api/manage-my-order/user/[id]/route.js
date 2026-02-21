// src/app/api/manage-my-order/user/[userId]/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// GET orders by user ID
export async function GET(request, { params }) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const ordersCollection = await dbConnect("orders");

    // Find all orders for this user
    const orders = await ordersCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Convert ObjectId to string for each order
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
