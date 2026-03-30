"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  ShoppingBag,
  Home,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

export default function OrderConfirmationClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get Order ID from URL
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // State for Copy Button feedback
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing. We couldn't identify your order.");
      setLoading(false);
      return;
    }

    if (orderId === "null" || orderId === "undefined") {
      setError("Invalid Order ID provided.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/manage-my-order/${orderId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch order details.");
        }

        const data = await response.json();

        if (data.success && data.data) {
          setOrderData(data.data);
        } else {
          throw new Error(data.message || "Order not found.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // --- COPY TO CLIPBOARD FUNCTION ---
  const handleCopyOrderId = async () => {
    if (!orderId) return;

    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(orderId);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = orderId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      // Show visual feedback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-50 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="w-full inline-flex justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden">
        {/* Success Header Section */}
        <div className="bg-green-50 p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. We have received your order.
          </p>
        </div>

        {/* Order Details Section */}
        <div className="p-8 space-y-6">
          {/* Order ID Box (WITH COPY FUNCTIONALITY) */}
          <div
            onClick={handleCopyOrderId}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition group relative"
            title="Click to copy Order ID"
          >
            <div className="text-left">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Order ID
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-bold text-gray-900 font-mono">
                  {/* Display truncated ID for UI cleanliness */}
                  {orderId ? orderId.substring(0, 12) + "..." : "N/A"}
                </p>
                {isCopied ? (
                  <span className="text-xs font-bold text-green-600 flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Copied!
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 group-hover:text-blue-500 transition">
                    <Copy className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Next Steps Text */}
          <div className="text-sm text-gray-600 leading-relaxed text-center">
            <p>
              We will send you an email confirmation shortly. If this is a Cash
              on Delivery order, our team will contact you to confirm delivery
              details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => router.push("/")}
              className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>

            <button
              onClick={() => router.push("/manage-add-to-cart")}
              className="w-full flex justify-center items-center px-4 py-3 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@yourstore.com"
              className="text-blue-600 hover:underline"
            >
              support@yourstore.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
