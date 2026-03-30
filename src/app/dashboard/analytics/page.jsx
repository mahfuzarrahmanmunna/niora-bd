"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AnalyticsPage = () => {
  // State to hold fetched data
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/products"),
          fetch("/api/manage-my-order"),
        ]);

        if (!usersRes.ok || !productsRes.ok || !ordersRes.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const usersData = await usersRes.json();
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        setUsers(usersData.data || []);
        setProducts(productsData.data || []);
        setOrders(ordersData.data || []);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived Statistics
  const analyticsData = useMemo(() => {
    // 1. Total Revenue
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = order.totalPrice || order.totalAmount || 0;
      return sum + (typeof amount === "string" ? parseFloat(amount) : amount);
    }, 0);

    // 2. Total Users (Replaces "Subscriptions" in UI)
    const totalUsers = users.length;

    // 3. Total Orders (Replaces "Sales" count in UI)
    const totalOrders = orders.length;

    // 4. Total Products (Replaces "Active Now" in UI)
    const totalProducts = products.length;

    // 5. Prepare Chart Data (Revenue over 12 months)
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

    // Initialize with 0
    const revenueByMonth = {};
    monthKeys.forEach((m) => (revenueByMonth[m] = 0));

    orders.forEach((order) => {
      if (order.createdAt) {
        const month = new Date(order.createdAt).toLocaleString("default", {
          month: "short",
        });
        if (revenueByMonth[month] !== undefined) {
          const amount = order.totalPrice || order.totalAmount || 0;
          revenueByMonth[month] +=
            typeof amount === "string" ? parseFloat(amount) : amount;
        }
      }
    });

    const chartData = monthKeys.map((month) => ({
      name: month,
      total: revenueByMonth[month] || 0,
    }));

    // 6. Recent Sales List
    const recentSales = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((order) => ({
        name:
          order.shippingAddress?.name || `Guest (${order.userId.slice(-4)})`,
        email: order.shippingAddress?.email || "No email provided",
        amount: `+$${(order.totalPrice || order.totalAmount || 0).toFixed(2)}`,
      }));

    return {
      totalRevenue,
      totalUsers,
      totalOrders,
      totalProducts,
      chartData,
      recentSales,
    };
  }, [users, products, orders]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard Analytics
        </h2>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Revenue
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground text-gray-500"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              $
              {analyticsData.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +20.1% from last month {/* Mock percentage for UI demo */}
            </p>
          </CardContent>
        </Card>

        {/* Total Users (Replacing Subscriptions) */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Users
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground text-gray-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.totalUsers}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Registered users
            </p>
          </CardContent>
        </Card>

        {/* Total Orders (Replacing Sales Count) */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Orders
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground text-gray-500"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.totalOrders}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Orders placed
            </p>
          </CardContent>
        </Card>

        {/* Total Products (Replacing Active Now) */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Products
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground text-gray-500"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.totalProducts}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Active in store
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Overview Chart */}
        <Card className="col-span-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analyticsData.chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                  itemStyle={{ color: "#000" }}
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="col-span-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Recent Sales
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              You made {analyticsData.totalOrders} sales this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {analyticsData.recentSales.length > 0 ? (
                analyticsData.recentSales.map((sale, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                      {sale.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                        {sale.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        {sale.email}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-green-600 dark:text-green-400">
                      {sale.amount}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent sales found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
