// app/api/sslcommerz/success/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const tran_id = formData.get("tran_id");
    const value_a = formData.get("value_a"); // This contains the order ID

    if (!tran_id || !value_a) {
      return NextResponse.redirect(new URL("/payment/failure", request.url));
    }

    // Verify the transaction with SSLCommerz
    const store_id = process.env.SSLCOMMERZ_STORE_ID;
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const is_sandbox = process.env.SSLCOMMERZ_SANDBOX === "true";

    const validationUrl = is_sandbox
      ? "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
      : "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";

    const validationParams = new URLSearchParams({
      store_id,
      store_passwd,
      val_id: tran_id,
      format: "json",
    });

    const validationResponse = await fetch(validationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: validationParams.toString(),
    });

    const validationData = await validationResponse.json();

    if (
      validationData.status === "VALID" ||
      validationData.status === "VALIDATED"
    ) {
      // Update the order status to paid
      const ordersCollection = await dbConnect("orders");

      let order;
      try {
        // Try to find by ObjectId first
        if (ObjectId.isValid(value_a)) {
          order = await ordersCollection.findOne({
            _id: new ObjectId(value_a),
          });
        }

        // If not found, try to find by string ID field
        if (!order) {
          order = await ordersCollection.findOne({ id: value_a });
        }
      } catch (error) {
        console.error("Error finding order:", error);
      }

      if (order) {
        await ordersCollection.updateOne(
          { _id: order._id },
          {
            $set: {
              status: "paid",
              paymentStatus: "completed",
              paymentInfo: {
                tran_id,
                status: "COMPLETED",
                paidAt: new Date(),
                validationData,
              },
              updatedAt: new Date(),
            },
          },
        );
      }

      // Redirect to success page
      return NextResponse.redirect(
        new URL(`/payment/success?orderId=${value_a}`, request.url),
      );
    } else {
      // Transaction validation failed
      return NextResponse.redirect(new URL("/payment/failure", request.url));
    }
  } catch (error) {
    console.error("Error processing SSLCommerz success callback:", error);
    return NextResponse.redirect(new URL("/payment/failure", request.url));
  }
}
