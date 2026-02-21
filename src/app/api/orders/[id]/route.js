// src/app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// GET single order by ID
export async function GET(request, { params }) {
  try {
    // In Next.js 15, params needs to be awaited
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 },
      );
    }

    const ordersCollection = await dbConnect("orders");

    let order = null;

    // Try with ObjectId first
    if (ObjectId.isValid(id)) {
      order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    }

    // Fallback to string id
    if (!order) {
      order = await ordersCollection.findOne({ _id: id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...order, _id: order._id.toString() },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PATCH - Update order status
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Order ID and status are required" },
        { status: 400 },
      );
    }

    const ordersCollection = await dbConnect("orders");

    let result = null;

    if (ObjectId.isValid(id)) {
      result = await ordersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
      );
    }

    if (!result || result.matchedCount === 0) {
      result = await ordersCollection.updateOne(
        { _id: id },
        { $set: { status, updatedAt: new Date() } },
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete order
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 },
      );
    }

    const ordersCollection = await dbConnect("orders");

    let result = null;

    if (ObjectId.isValid(id)) {
      result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
    }

    if (!result || result.deletedCount === 0) {
      result = await ordersCollection.deleteOne({ _id: id });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
