// src/app/manage-my-order/[id]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Package, Calendar, DollarSign, MapPin, CreditCard, Truck } from "lucide-react";

const OrderDetailsPage = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/manage-my-order/${orderId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch order');
      }

      setOrder(data.data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.message || "Failed to fetch order details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const response = await fetch(`/api/manage-my-order/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel order: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      // Refresh order details
      fetchOrderDetails();
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(err.message || "Failed to cancel order. Please try again.");
    }
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
            onClick={() => router.push("/manage-my-order")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/manage-my-order")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order ID: {order._id}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>
              <dl className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(order.createdAt)}</dd>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd className="text-sm text-gray-900">${order.totalPrice.toFixed(2)}</dd>
                  </div>
                </div>
                {order.paymentInfo && (
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                      <dd className="text-sm text-gray-900">{order.paymentInfo.gateway || "N/A"}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Shipping Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              <dl className="space-y-3">
                {order.shippingAddress && (
                  <>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                        <dd className="text-sm text-gray-900">
                          <p>{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                          <p>{order.shippingAddress.phone}</p>
                        </dd>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Delivery Status</dt>
                    <dd className="text-sm text-gray-900">{order.status}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <div key={index} className="p-6 flex items-center">
                <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl || "https://picsum.photos/seed/product/200/200.jpg"}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="ml-6 flex-1">
                  <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Price: ${item.price.toFixed(2)}</p>
                  <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-medium text-gray-900">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Actions */}
        {order.status === "pending" && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;