// src/app/payment/success/page.jsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Check, Home } from "lucide-react";

const PaymentSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // In a real implementation, you would verify the payment with the payment gateway
    // and update the order status in your database
    if (orderId) {
      // Update order status to "paid" or "processing"
      fetch(`/api/orders/${orderId}/payment-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Payment verified and order updated");
          } else {
            console.error("Failed to verify payment:", data.message);
          }
        })
        .catch((err) => console.error("Error verifying payment:", err));
    }
  }, [orderId]);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="bg-green-100 text-green-600 p-6 rounded-lg">
          <Check className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="mb-4">
            Your payment has been processed successfully. We'll send you a confirmation
            email shortly.
          </p>
          <p className="text-sm">Order ID: {orderId}</p>
        </div>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push("/order-confirmation?orderId=" + orderId)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View Order Details
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full flex justify-center items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;