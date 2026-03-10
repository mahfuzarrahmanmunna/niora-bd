"use client";

import React, { useState, useEffect } from "react";

// Helper for formatting currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function AdminManageOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch ALL orders
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters whenever orders or filter states change
  useEffect(() => {
    let result = orders;

    // Status Filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Search Filter (Search by Order ID or User ID)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          (order._id && order._id.toLowerCase().includes(lowerQuery)) ||
          (order.userId && order.userId.toLowerCase().includes(lowerQuery)),
      );
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Call without userId query param to get ALL orders
      const res = await fetch("/api/manage-my-order");
      const json = await res.json();

      if (json.success) {
        setOrders(json.data);
      } else {
        console.error("Failed to fetch:", json.message);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    // If we already have the data in the list, use it to save a call
    const existing = orders.find((o) => o._id === orderId || o.id === orderId);
    if (existing && existing.items) {
      setSelectedOrder(existing);
      setIsModalOpen(true);
      return;
    }

    // Otherwise fetch fresh details
    try {
      const res = await fetch(`/api/manage-my-order/${orderId}`);
      const json = await res.json();
      if (json.success) {
        setSelectedOrder(json.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      alert("Failed to load order details");
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (!selectedOrder) return;

    if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`))
      return;

    try {
      const res = await fetch(
        `/api/manage-my-order/${selectedOrder._id || selectedOrder.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const json = await res.json();
      if (json.success) {
        // Update local state
        const updatedOrders = orders.map((o) =>
          o._id === selectedOrder._id || o.id === selectedOrder.id
            ? { ...o, status: newStatus, updatedAt: new Date() }
            : o,
        );
        setOrders(updatedOrders);
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        alert("Order status updated!");
      } else {
        alert("Failed to update: " + json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order");
    }
  };

  // Calculate Stats
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-gray-100"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Admin Order Management
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-t-lg border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">
              Filter Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search Order ID or User ID..."
              className="w-full border rounded pl-3 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search absolute right-3 top-2.5 text-gray-400 text-xs"></i>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow-sm rounded-b-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No orders found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        {order._id ? order._id.substring(0, 8) + "..." : "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px]"
                        title={order.userId}
                      >
                        {order.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleViewDetails(order._id || order.id)
                          }
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Order Details
                </h2>
                <p className="text-sm text-gray-500">ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Items & Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3">
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-4">
                        <img
                          src={
                            item.imageUrl || "https://via.placeholder.com/60"
                          }
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded bg-gray-100"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="font-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Customer Information
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">User ID:</span>{" "}
                      {selectedOrder.userId}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      user@example.com (Mock)
                    </p>{" "}
                    {/* Assuming email comes from user profile normally */}
                    {selectedOrder.paymentMethod && (
                      <p>
                        <span className="font-medium">Payment Method:</span>
                        <span className="uppercase ml-1">
                          {selectedOrder.paymentMethod}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Shipping & Actions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3">
                    Shipping Address
                  </h3>
                  {selectedOrder.shippingAddress ? (
                    <div className="bg-gray-50 p-4 rounded text-sm text-gray-700">
                      <p className="font-bold text-lg">
                        {selectedOrder.shippingAddress.fullName}
                      </p>
                      <p>{selectedOrder.shippingAddress.phone}</p>
                      <p>{selectedOrder.shippingAddress.address}</p>
                      <p>
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.zipCode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      No shipping address provided yet.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3">
                    Order Management
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Current Status: {getStatusBadge(selectedOrder.status)}
                    </p>

                    {/* Action Buttons based on current status */}
                    {selectedOrder.status === "pending" && (
                      <button
                        onClick={() => updateOrderStatus("confirmed")}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                      >
                        Confirm Order
                      </button>
                    )}

                    {selectedOrder.status === "confirmed" && (
                      <button
                        onClick={() => updateOrderStatus("shipped")}
                        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
                      >
                        Mark as Shipped
                      </button>
                    )}

                    {selectedOrder.status === "shipped" && (
                      <button
                        onClick={() => updateOrderStatus("delivered")}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                      >
                        Mark as Delivered
                      </button>
                    )}

                    {selectedOrder.status !== "cancelled" &&
                      selectedOrder.status !== "delivered" && (
                        <button
                          onClick={() => updateOrderStatus("cancelled")}
                          className="w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 transition mt-2 border border-red-200"
                        >
                          Cancel Order
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
