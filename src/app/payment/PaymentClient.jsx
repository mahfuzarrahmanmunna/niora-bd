"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, ArrowLeft, Truck, AlertCircle, Package } from "lucide-react";

export default function PaymentClient() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Bangladesh",
  });

  // ============================================================
  // ✅ READ ORDER FROM localStorage (NOT from URL or database)
  // ============================================================
  useEffect(() => {
    try {
      const pendingOrder = localStorage.getItem("pendingOrder");

      if (!pendingOrder) {
        setError("No pending order found. Please go back and try again.");
        setIsLoading(false);
        return;
      }

      const orderData = JSON.parse(pendingOrder);
      setOrder(orderData);
    } catch (err) {
      console.error("Error reading order from localStorage:", err);
      setError("Invalid order data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================
  // HANDLE PAYMENT (COD ONLY) - Creates order in DB on confirm
  // ============================================================
  const handleInputChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!order) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/manage-my-order/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInfo,
          items: order.items,
          totalPrice: order.totalPrice,
          shippingCost: order.shippingCost,
          shippingLocation: order.shippingLocation,
        }),
      });

      // Handle HTML responses (missing API routes)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error(
          "COD API route not found. Make sure /api/manage-my-order/cod/route.js exists.",
        );
      }

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          errorMessage = errData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        // ✅ Clear localStorage after successful order
        localStorage.removeItem("pendingOrder");
        router.push(`/order-confirmation?orderId=${data.data._id}`);
      } else {
        throw new Error(data.message || "Order confirmation failed.");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err.message || "Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const formatPrice = (price) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // ============================================================
  // RENDER: Error / No Order
  // ============================================================
  if (error && !order) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <div className="bg-red-100 text-red-600 p-6 rounded-lg">
            <AlertCircle className="h-10 w-10 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Loading
  // ============================================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Main Payment Form
  // ============================================================
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                    onClick={() => setError(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Order Summary
              </h2>
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between bg-white rounded p-3"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        ৳{formatPrice(item.price)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No items found</p>
                )}

                <div className="border-t border-blue-200 pt-3 mt-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      ৳
                      {formatPrice(
                        order.totalPrice - (order.shippingCost || 0),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>৳{formatPrice(order.shippingCost || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <div className="font-semibold text-gray-900">Total</div>
                    <div className="font-bold text-blue-600 text-lg">
                      ৳{formatPrice(order.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Steadfast Courier
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.shippingLocation === "inside"
                        ? "Inside Dhaka"
                        : "Outside Dhaka"}{" "}
                      — ৳{formatPrice(order.shippingCost || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-gray-500">
                      Pay when you receive your order
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Form */}
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  Delivery Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="01XXXXXXXXX"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Dhaka"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address
                    </label>
                    <input
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      required
                      placeholder="House, Road, Area"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Truck className="h-5 w-5 mr-2" />
                      Confirm Cash on Delivery
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
