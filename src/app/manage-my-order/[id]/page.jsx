// src/app/manage-my-order/[id]/page.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  CreditCard,
  Truck,
  Package,
} from "lucide-react";

const OrderDetailsPage = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${params.id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch order: ${response.status}`,
        );
      }

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch order");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: "bg-green-100 text-green-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) throw new Error("Failed to cancel order");

      hasFetchedRef.current = false;
      fetchOrderDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <Package className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Order not found"}</p>
          <button
            onClick={() => router.push("/manage-my-order")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/manage-my-order")}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Details
              </h1>
              <p className="text-gray-600 mt-1">
                Order ID: #{order._id?.substring(0, 8)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getPaymentStatusColor(order.paymentStatus)}`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-sm text-gray-900">
                      ${order.totalPrice?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Delivery
              </h2>
              <div className="flex items-start gap-2">
                <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm text-gray-900 capitalize">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div className="divide-y">
            {order.items?.map((item, index) => (
              <div key={index} className="p-6 flex items-center gap-4">
                <img
                  src={
                    item.imageUrl ||
                    `https://picsum.photos/seed/${item.productId}/200/200.jpg`
                  }
                  alt={item.name}
                  className="w-20 h-20 rounded-md object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    ${item.price?.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
            <span className="font-medium text-gray-900">Total</span>
            <span className="font-medium text-gray-900">
              ${order.totalPrice?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        {order.status === "pending" && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
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
