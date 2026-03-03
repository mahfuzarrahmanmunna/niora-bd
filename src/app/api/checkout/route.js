import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress, paymentMethod } = body;

    console.log("--- Checkout Request ---");
    console.log("User ID:", userId);
    console.log("Items Count:", items?.length);

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "User ID and items are required" },
        { status: 400 },
      );
    }

    const productsCollection = await dbConnect("products");

    // 1. Fetch Products and Validate
    const products = await Promise.all(
      items.map(async (item) => {
        let query = {};

        // Robust ID Querying
        if (ObjectId.isValid(item.productId) && item.productId.length === 24) {
          try {
            query = { _id: new ObjectId(item.productId) };
          } catch (e) {
            query = { id: item.productId };
          }
        } else {
          query = { id: item.productId };
        }

        const product = await productsCollection.findOne(query);

        if (!product) {
          console.error(`Product NOT FOUND for ID: ${item.productId}`);
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        return {
          ...item,
          product,
        };
      }),
    );

    // 2. Check Stock and Calculate Price
    let totalPrice = 0;

    for (const item of products) {
      const stock = parseInt(item.product.stock) || 0;
      const requestedQty = parseInt(item.quantity) || 1;

      if (stock < requestedQty) {
        throw new Error(`Not enough stock for ${item.product.name}`);
      }

      // Safe Price Calculation
      let itemPrice = parseFloat(item.product.price) || 0;
      const discount = parseFloat(item.product.discount) || 0;

      // Check if finalPrice exists and is valid, otherwise calculate
      if (
        item.product.finalPrice &&
        !isNaN(parseFloat(item.product.finalPrice))
      ) {
        itemPrice = parseFloat(item.product.finalPrice);
      } else if (discount > 0) {
        // Assuming discount is a percentage (e.g., 10 means 10%)
        itemPrice = itemPrice * (1 - discount / 100);
      }

      totalPrice += itemPrice * requestedQty;
    }

    console.log("Calculated Total Price:", totalPrice);

    // 3. Create Order Object
    const order = {
      userId,
      items: products.map((item) => {
        let price = parseFloat(item.product.price) || 0;
        const discount = parseFloat(item.product.discount) || 0;
        let finalPrice = price;

        if (
          item.product.finalPrice &&
          !isNaN(parseFloat(item.product.finalPrice))
        ) {
          finalPrice = parseFloat(item.product.finalPrice);
        } else if (discount > 0) {
          finalPrice = price * (1 - discount / 100);
        }

        return {
          productId: item.productId,
          name: item.product.name,
          price: finalPrice,
          quantity: parseInt(item.quantity) || 1,
          imageUrl: item.product.imageUrls?.[0] || item.product.imageUrl,
        };
      }),
      shippingAddress: shippingAddress || null,
      paymentMethod: paymentMethod || "cod",
      totalPrice,
      status: "processing",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 4. Insert Order into Database
    const ordersCollection = await dbConnect("orders");
    const result = await ordersCollection.insertOne(order);

    if (!result.insertedId) {
      throw new Error("Failed to save order to database");
    }

    console.log("Order Created ID:", result.insertedId);

    // 5. Update Product Stock
    for (const item of products) {
      const qty = parseInt(item.quantity) || 1;
      await productsCollection.updateOne(
        { _id: item.product._id },
        { $inc: { stock: -qty } },
      );
    }
    console.log("Stock updated.");

    // 6. Clear User's Cart
    try {
      const cartCollection = await dbConnect("cart");
      const productIds = items.map((item) => item.productId);
      await cartCollection.deleteMany({
        userId,
        productId: { $in: productIds },
      });
      console.log("Cart cleared.");
    } catch (cartErr) {
      console.error("Error clearing cart (non-fatal):", cartErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        orderId: result.insertedId.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("=== CHECKOUT FATAL ERROR ===");
    console.error(error.message);
    console.error(error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process checkout",
      },
      { status: 500 },
    );
  }
}

// GET method for order history (unchanged)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const collection = await dbConnect("orders");
    const orders = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
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
