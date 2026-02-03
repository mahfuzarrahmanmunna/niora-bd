"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Loader,
  ArrowLeft,
  Truck,
  Smartphone,
  Send,
  AlertCircle,
} from "lucide-react";

export default function PaymentClient() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to COD
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Bangladesh",
  });

  useEffect(() => {
    if (!orderId) {
      console.log("No orderId found, redirecting to cart");
      router.push("/cart");
      return;
    }

    console.log("=== DEBUG: Payment Page ===");
    console.log("Order ID from URL:", orderId);
    console.log("Order ID type:", typeof orderId);

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching order from API...");
        const response = await fetch(`/api/manage-my-order/${orderId}`);

        console.log("Response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries(response.headers.entries()),
        );

        // Check if response is HTML (likely a 404 page)
        const contentType = response.headers.get("content-type");
        console.log("Content-Type:", contentType);

        if (contentType && contentType.includes("text/html")) {
          console.log("Received HTML response, likely a 404 page");
          throw new Error("Order not found");
        }

        if (!response.ok) {
          console.log("Response not OK, trying to parse error...");
          const errorText = await response.text();
          console.log("Error response text:", errorText);

          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            console.log("Could not parse error as JSON");
          }

          throw new Error(
            errorData?.message ||
              `Failed to fetch order with status ${response.status}`,
          );
        }

        const data = await response.json();
        console.log("Order data received:", data);

        if (data.success) {
          console.log("Order found, setting state");
          setOrder(data.data);
        } else {
          console.log("API returned success: false");
          throw new Error(data.message || "Failed to fetch order details.");
        }
      } catch (err) {
        console.error("=== ERROR IN FETCH ORDER ===");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        setError(
          err.message ||
            "An unexpected error occurred while fetching your order. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleInputChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!order) return;

    setIsProcessing(true);
    setError(null);

    try {
      let apiEndpoint;
      let requestBody;

      switch (paymentMethod) {
        case "sslcommerz":
          apiEndpoint = "/api/sslcommerz/init";
          requestBody = {
            orderId: order._id,
            amount: order.totalPrice,
            customerInfo,
          };
          break;
        case "bkash":
          apiEndpoint = "/api/bkash/init";
          requestBody = {
            orderId: order._id,
            amount: order.totalPrice,
            customerInfo,
          };
          break;
        case "rocket":
          apiEndpoint = "/api/rocket/init";
          requestBody = {
            orderId: order._id,
            amount: order.totalPrice,
            customerInfo,
          };
          break;
        case "nagad":
          apiEndpoint = "/api/nagad/init";
          requestBody = {
            orderId: order._id,
            amount: order.totalPrice,
            customerInfo,
          };
          break;
        case "cod":
          apiEndpoint = "/api/manage-my-order/cod";
          requestBody = {
            orderId: order._id,
            customerInfo,
          };
          break;
        default:
          throw new Error("Invalid payment method selected");
      }

      console.log(`Sending request to ${apiEndpoint} with data:`, requestBody);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("API Response Status:", response.status);
      const responseText = await response.text();
      console.log("API Response Body (raw):", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse API response as JSON:", parseError);
        throw new Error("Server returned an invalid response.");
      }

      if (data.success) {
        if (paymentMethod === "sslcommerz") {
          window.location.href = data.paymentUrl;
        } else if (paymentMethod === "cod") {
          router.push(`/order-confirmation?orderId=${order._id}`);
        } else {
          // For other payment methods, redirect to their respective payment pages
          window.location.href = data.paymentUrl;
        }
      } else {
        // Improved error handling for payment gateway specific errors
        let errorMessage = data.message || "Payment initiation failed.";

        if (
          errorMessage.includes("Store Credential Error") ||
          errorMessage.includes("Store is De-active")
        ) {
          errorMessage =
            "Payment gateway credentials are invalid. Please use Cash on Delivery or contact support.";
        }

        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err.message || "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for formatting price
  const formatPrice = (price) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <div className="bg-red-100 text-red-600 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error || "Order not found"}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium mb-2">Shipping</h2>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.address || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium mb-2">Items</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between bg-white rounded p-2"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ${formatPrice(item.price)}
                    </div>
                  </div>
                ))}

                <div className="border-t pt-2 mt-2 flex justify-between">
                  <div className="font-medium">Total</div>
                  <div className="font-semibold">
                    ${formatPrice(order.totalPrice)}
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handlePayment}
              className="bg-gray-50 p-4 rounded-md"
            >
              <h2 className="text-lg font-medium mb-2">Payment</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="sslcommerz">SSLCommerz</option>
                  <option value="bkash">Bkash</option>
                  <option value="rocket">Rocket</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="border rounded px-3 py-2"
                />
                <input
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="border rounded px-3 py-2"
                />
                <input
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="border rounded px-3 py-2"
                />
                <input
                  name="city"
                  value={customerInfo.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="border rounded px-3 py-2"
                />
                <input
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="border rounded px-3 py-2 md:col-span-2"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    "Pay"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/cart")}
                  className="px-4 py-2 bg-gray-100 rounded-md"
                >
                  <ArrowLeft className="inline mr-2" /> Back to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
