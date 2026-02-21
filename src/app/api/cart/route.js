import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

// GET cart items for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Return empty cart if no userId (don't throw 400 error)
    if (!userId) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const collection = await dbConnect("cart");
    const cartItems = await collection.find({ userId }).toArray();

    // If you need product details, fetch them
    // const productsCollection = await dbConnect('products');
    // const cartWithProducts = await Promise.all(
    //   cartItems.map(async (item) => {
    //     const product = await productsCollection.findOne({ _id: item.productId });
    //     return { ...item, product };
    //   })
    // );

    return NextResponse.json(
      { success: true, data: cartItems },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart", error: error.message },
      { status: 500 },
    );
  }
}

// POST - Add item to cart
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, productId, quantity = 1 } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, message: "userId and productId are required" },
        { status: 400 },
      );
    }

    const cartCollection = await dbConnect("cart");
    const existingItem = await cartCollection.findOne({ userId, productId });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      await cartCollection.updateOne(
        { _id: existingItem._id },
        { $set: { quantity: newQuantity, updatedAt: new Date() } },
      );
    } else {
      await cartCollection.insertOne({
        userId,
        productId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(
      { success: true, message: "Item added to cart" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add item to cart",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, productId, quantity } = body;

    if (!userId || !productId || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "userId, productId, and quantity are required",
        },
        { status: 400 },
      );
    }

    const cartCollection = await dbConnect("cart");

    if (quantity <= 0) {
      await cartCollection.deleteOne({ userId, productId });
    } else {
      await cartCollection.updateOne(
        { userId, productId },
        { $set: { quantity, updatedAt: new Date() } },
      );
    }

    return NextResponse.json(
      { success: true, message: "Cart updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, message: "userId and productId are required" },
        { status: 400 },
      );
    }

    const collection = await dbConnect("cart");
    await collection.deleteOne({ userId, productId });

    return NextResponse.json(
      { success: true, message: "Item removed from cart" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove item",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
