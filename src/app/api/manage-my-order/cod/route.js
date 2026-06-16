import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const { customerInfo, items, totalPrice, shippingCost, shippingLocation } =
      await request.json();

    // ✅ এখন items এবং customerInfo আবশ্যক, orderId নয়
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items are required" },
        { status: 400 },
      );
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return NextResponse.json(
        { success: false, message: "Customer name and phone are required" },
        { status: 400 },
      );
    }

    const ordersCollection = await dbConnect("orders");

    // ✅ ইউজার আইডি তৈরি (ফোন নম্বর দিয়ে বা guest হিসেবে)
    const userId = customerInfo.phone || "guest-" + Date.now();

    // ✅ প্রোডাক্ট ভেরিফাই করুন (ঐচ্ছিক কিন্তু রিকমেন্ডেড)
    const verifiedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const productsCollection = await dbConnect("products");
      let product = null;

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
      } catch (e) {
        // Ignore lookup error
      }

      if (product) {
        const itemPrice = product.finalPrice || product.price;
        calculatedTotal += itemPrice * item.quantity;
        verifiedItems.push({
          productId: product._id ? product._id.toString() : product.id,
          name: product.name,
          price: itemPrice,
          quantity: item.quantity,
          imageUrl: product.imageUrl || item.imageUrl || "",
        });
      } else {
        // প্রোডাক্ট খুঁজে না পাওয়া গেলে যা আছে তাই ব্যবহার করুন
        verifiedItems.push({
          productId: item.productId,
          name: item.name || "Unknown Product",
          price: item.price || 0,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl || "",
        });
        calculatedTotal += (item.price || 0) * (item.quantity || 1);
      }
    }

    const newOrder = {
      userId,
      items: verifiedItems,
      totalPrice: totalPrice * 3 || calculatedTotal,
      shippingCost: shippingCost || 0,
      shippingLocation: shippingLocation || "inside",
      paymentMethod: "cod",
      shippingAddress: customerInfo,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(newOrder);

    return NextResponse.json({
      success: true,
      message: "Order confirmed with Cash on Delivery",
      data: {
        ...newOrder,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Error processing COD order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
