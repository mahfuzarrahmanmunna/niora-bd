// src/app/payment/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  Truck,
  Smartphone,
  Send,
  AlertCircle,
  Package,
} from "lucide-react";

const PaymentPage = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Payment and Delivery State
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("steadfast"); // Default delivery method

  const router = useRouter();
  const [orderId, setOrderId] = useState(null);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Bangladesh",
  });

  // 1. Get Order ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId");
    if (id) {
      setOrderId(id);
    } else {
      setError("No Order ID provided.");
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch Order Data
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/manage-my-order/${orderId}`);

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error("Order not found (404)");
        }

        const data = await response.json();

        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch order details.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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

      // Common payload data
      const basePayload = {
        orderId: order._id,
        amount: order.totalPrice,
        customerInfo,
        deliveryMethod, // Sending the selected delivery method
      };

      switch (paymentMethod) {
        case "bkash":
          apiEndpoint = "/api/bkash/init";
          requestBody = basePayload;
          break;
        case "nagad":
          apiEndpoint = "/api/nagad/init";
          requestBody = basePayload;
          break;
        case "cod":
          apiEndpoint = "/api/manage-my-order/cod";
          requestBody = basePayload;
          break;
        default:
          throw new Error("Invalid payment method selected");
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        if (paymentMethod === "bkash" || paymentMethod === "nagad") {
          // Redirect to bKash/Nagad gateway
          window.location.href = data.paymentUrl;
        } else if (paymentMethod === "cod") {
          // Redirect to success page for Cash on Delivery
          router.push(`/order-confirmation?orderId=${order._id}`);
        }
      } else {
        throw new Error(data.message || "Payment initiation failed.");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err.message);
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
            onClick={() => router.push("/manage-add-to-cart")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
            onClick={() => router.push("/manage-add-to-cart")}
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
                    <button
                      type="button"
                      className="bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100"
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-8">
            {/* Delivery Method Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delivery Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 border-blue-200 bg-blue-50">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="steadfast"
                    checked={deliveryMethod === "steadfast"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <Package className="h-5 w-5 mr-3 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Steadfast Courier
                    </p>
                    <p className="text-sm text-gray-500">
                      Fast and reliable home delivery inside Bangladesh
                    </p>
                  </div>
                </label>
                {/* You can add more delivery methods here if needed */}
              </div>
            </div>

            {/* Payment Method Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Method
              </h3>
              <div className="space-y-3">
                {/* bKash */}
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

                {/* Nagad */}
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

                {/* Cash on Delivery */}
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
              </div>
            </div>

            {/* Billing Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Billing Information
              </h3>
              <div className="mt-4 space-y-4">
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
                  {paymentMethod === "bkash" && (
                    <>
                      <Smartphone className="h-5 w-5 mr-2" />
                      Pay with bKash
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
