// src/app/dashboard/page.js
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
// Import Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Raw data states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all three data sources in parallel
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/products"),
          fetch("/api/manage-my-order"),
        ]);

        if (!usersRes.ok || !productsRes.ok || !ordersRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const usersData = await usersRes.json();
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        setUsers(usersData.data || []);
        setProducts(productsData.data || []);
        setOrders(ordersData.data || []);

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper: Get Month Name from ISO String
  const getMonthName = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString("default", { month: "short" });
  };

  // Derived Stats Calculation
  const dashboardData = useMemo(() => {
    // 1. Basic Counts
    const totalUsers = users.length;
    const totalProducts = products.length;
    const totalOrders = orders.length;

    // 2. Total Revenue (sum of totalPrice or totalAmount)
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = order.totalPrice || order.totalAmount || 0;
      return sum + (typeof amount === "string" ? parseFloat(amount) : amount);
    }, 0);

    // 3. Recent Orders (Last 5, sorted by date)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((order) => ({
        id: order._id,
        customer:
          order.shippingAddress?.name || `Guest (${order.userId.slice(-4)})`,
        date: new Date(order.createdAt).toLocaleDateString(),
        amount: order.totalPrice || order.totalAmount || 0,
        status: order.status || "Pending",
      }));

    // 4. Top Products (Aggregated from Order Items)
    const productStats = {};
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const name = item.name || "Unknown Product";
          if (!productStats[name]) {
            productStats[name] = { sales: 0, revenue: 0 };
          }
          productStats[name].sales += item.quantity || 0;
          const price =
            typeof item.price === "string"
              ? parseFloat(item.price)
              : item.price || 0;
          productStats[name].revenue += price * (item.quantity || 0);
        });
      }
    });

    const topProducts = Object.entries(productStats)
      .map(([name, stats]) => ({ id: name, name, ...stats }))
      .sort((a, b) => b.sales - a.sales) // Sort by sales count
      .slice(0, 5);

    // 5. Monthly Sales (Last 6 months logic)
    const monthKeys = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const salesByMonth = {};

    // Initialize with 0
    monthKeys.forEach((m) => (salesByMonth[m] = 0));

    orders.forEach((order) => {
      const month = getMonthName(order.createdAt);
      if (salesByMonth[month] !== undefined) {
        const amount = order.totalPrice || order.totalAmount || 0;
        salesByMonth[month] +=
          typeof amount === "string" ? parseFloat(amount) : amount;
      }
    });

    // Convert to array format for chart
    const currentMonthIndex = new Date().getMonth();
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      const monthName = monthKeys[idx];
      monthlySales.push({
        month: monthName,
        sales: salesByMonth[monthName] || 0,
      });
    }

    // 6. User Growth
    const usersByMonth = {};
    monthKeys.forEach((m) => (usersByMonth[m] = 0));

    users.forEach((user) => {
      const month = getMonthName(user.createdAt);
      if (usersByMonth[month] !== undefined) {
        usersByMonth[month]++;
      }
    });

    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      const monthName = monthKeys[idx];
      userGrowth.push({ month: monthName, users: usersByMonth[monthName] });
    }

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      monthlySales,
      userGrowth,
    };
  }, [users, products, orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "Processing":
      case "processing":
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Error loading data: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {session?.user?.name || "Admin"}. Here is what is
          happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboardData.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/users"
                className="font-medium text-blue-700 hover:text-blue-600"
              >
                View all users
              </Link>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboardData.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/manage-products"
                className="font-medium text-blue-700 hover:text-blue-600"
              >
                View all products
              </Link>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboardData.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/manage-order"
                className="font-medium text-blue-700 hover:text-blue-600"
              >
                View all orders
              </Link>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${" "}
                    {dashboardData.totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/analytics"
                className="font-medium text-blue-700 hover:text-blue-600"
              >
                View analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Sales
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            User Growth
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="users" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Orders
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest orders from your customers
            </p>
          </div>
          {dashboardData.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link
                          href={`/dashboard/manage-order/${order.id}`}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          {order.id.slice(-6)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${parseFloat(order.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recent orders found.
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/manage-order"
                className="font-medium text-blue-700 hover:text-blue-600"
              >
                View all orders
              </Link>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Top Products
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Best-selling products this month
            </p>
          </div>
          {dashboardData.topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs"
                        title={product.name}
                      >
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${" "}
                        {product.revenue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No sales data yet.
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/manage-products"
                className="font-medium text-blue-700 hover:text-blue-600"
              >
                View all products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Common tasks you might want to perform
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/add-product"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
