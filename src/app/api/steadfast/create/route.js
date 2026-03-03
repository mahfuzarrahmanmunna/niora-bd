import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const { orderId, customerInfo, paymentMethod } = await request.json();

    if (!orderId || !customerInfo) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID and customer information are required",
        },
        { status: 400 },
      );
    }

    // Get order details
    const ordersCollection = await dbConnect("orders");
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Steadfast Configuration
    const api_key = process.env.STEADFAST_API_KEY;
    const secret_key = process.env.STEADFAST_SECRET_KEY;
    const is_sandbox = process.env.STEADFAST_SANDBOX === "true";

    if (!api_key || !secret_key) {
      console.error("Steadfast credentials missing");
      return NextResponse.json(
        {
          success: false,
          message:
            "Courier service configuration error. Steadfast credentials are missing.",
        },
        { status: 500 },
      );
    }

    // Steadfast API Endpoint
    // Sandbox URL: https://sandbox.steadfast.com.bd/api/v1/create_order
    // Live URL: https://portal.steadfast.com.bd/api/v1/create_order
    const steadfastUrl = is_sandbox
      ? "https://sandbox.steadfast.com.bd/api/v1/create_order"
      : "https://portal.steadfast.com.bd/api/v1/create_order";

    // Determine COD Amount (Only add COD charge if payment method is Cash on Delivery)
    const codAmount = paymentMethod === "cod" ? order.totalPrice : 0;

    // Prepare payload for Steadfast
    const payload = {
      invoice: order._id.toString(), // Using Order ID as Invoice
      recipient_name: customerInfo.name,
      recipient_address: `${customerInfo.address}, ${customerInfo.city}`,
      recipient_phone: customerInfo.phone.replace(/\D/g, ""), // Remove non-numeric chars
      cod_amount: codAmount,
      delivery_type: "SDD", // Same Day Delivery or NDD (Next Day Delivery)
      item_type: "parcel",
      special_instruction: "Please handle with care.",
      items_quantity: 1, // You can calculate actual items from order.cart if needed
      item_weight: 0.5, // Default weight in KG, adjust as needed
      distance: "intra_dhaka", // or 'intra_city' / 'suburban'
      // Optional: Pick location ID if you have multiple pickup locations in Steadfast
      // pick_location: "Main Warehouse"
    };

    // Call Steadfast API
    const steadfastResponse = await fetch(steadfastUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": api_key,
        "Secret-Key": secret_key,
      },
      body: JSON.stringify(payload),
    });

    const steadfastData = await steadfastResponse.json();

    if (steadfastResponse.ok && steadfastData.status === 200) {
      // Steadfast returns the tracking/consignment info
      const consignmentInfo = steadfastData.data; // Typically { consignment_id, tracking_code ... }

      // Update the order in your database
      await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            deliveryInfo: {
              provider: "Steadfast",
              status: "PROCESSING", // Initial status
              consignmentId: consignmentInfo.consignment_id,
              trackingCode: consignmentInfo.tracking_code,
              rawResponse: consignmentInfo,
            },
            updatedAt: new Date(),
          },
        },
      );

      return NextResponse.json({
        success: true,
        message: "Delivery booked successfully with Steadfast",
        trackingCode: consignmentInfo.tracking_code,
        consignmentId: consignmentInfo.consignment_id,
      });
    } else {
      console.error("Steadfast API Error:", steadfastData);
      return NextResponse.json(
        {
          success: false,
          message:
            steadfastData.message || "Failed to book delivery with Steadfast",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error initializing Steadfast delivery:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
