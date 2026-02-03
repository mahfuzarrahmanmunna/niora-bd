// src/app/payment/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Loader,
  ArrowLeft,
  Truck,
  Smartphone,
  Send,
  AlertCircle,
} from "lucide-react";

const PaymentPage = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to COD
  const router = useRouter();
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get("orderId"));
  }, []);

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
      setError(
        err.message ||
          "Failed to process payment. Please check your information and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <div className="bg-red-100 text-red-600 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <p className="text-sm mt-2">Order ID: {orderId}</p>
          </div>
          <button
            onClick={() => router.push("/cart")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/cart")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Payment
          </h1>
          <p className="text-gray-600 mb-6">Order ID: {orderId}</p>

          <div className="mb-8 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>
            <p className="text-2xl font-bold text-blue-600">
              Total Amount: ${order ? order.totalPrice.toFixed(2) : "0.00"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Payment Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        type="button"
                        className="ml-3 bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                        onClick={() => setError(null)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-6">
            {/* Payment Method Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Truck className="h-5 w-5 mr-2 text-green-600" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="sslcommerz"
                    checked={paymentMethod === "sslcommerz"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  <div>
                    <p className="font-medium">
                      Credit/Debit Card (SSLCommerz)
                    </p>
                    <p className="text-sm text-gray-500">
                      Pay with Visa, Mastercard, or other cards
                    </p>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={paymentMethod === "bkash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Smartphone className="h-5 w-5 mr-2 text-pink-600" />
                  <div>
                    <p className="font-medium">bKash</p>
                    <p className="text-sm text-gray-500">
                      Mobile banking payment
                    </p>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="rocket"
                    checked={paymentMethod === "rocket"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Send className="h-5 w-5 mr-2 text-purple-600" />
                  <div>
                    <p className="font-medium">Rocket</p>
                    <p className="text-sm text-gray-500">
                      Mobile banking payment
                    </p>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="nagad"
                    checked={paymentMethod === "nagad"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Send className="h-5 w-5 mr-2 text-orange-600" />
                  <div>
                    <p className="font-medium">Nagad</p>
                    <p className="text-sm text-gray-500">
                      Mobile banking payment
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900">
              Billing Information
            </h3>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={customerInfo.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={customerInfo.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={customerInfo.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={customerInfo.address}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={customerInfo.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={customerInfo.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === "sslcommerz" && (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pay with SSLCommerz
                    </>
                  )}
                  {paymentMethod === "bkash" && (
                    <>
                      <Smartphone className="h-5 w-5 mr-2" />
                      Pay with bKash
                    </>
                  )}
                  {paymentMethod === "rocket" && (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Pay with Rocket
                    </>
                  )}
                  {paymentMethod === "nagad" && (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Pay with Nagad
                    </>
                  )}
                  {paymentMethod === "cod" && (
                    <>
                      <Truck className="h-5 w-5 mr-2" />
                      Confirm Cash on Delivery Order
                    </>
                  )}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
