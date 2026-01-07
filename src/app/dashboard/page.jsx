// src/app/dashboard/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const DashboardPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        topProducts: [],
        monthlySales: [],
        userGrowth: []
    });

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real app, you would fetch this data from your API
                // For now, we'll use mock data
                setTimeout(() => {
                    setDashboardData({
                        totalUsers: 1234,
                        totalProducts: 567,
                        totalOrders: 890,
                        totalRevenue: 45678.90,
                        recentOrders: [
                            { id: 'ORD001', customer: 'John Doe', date: '2023-06-15', amount: 129.99, status: 'Delivered' },
                            { id: 'ORD002', customer: 'Jane Smith', date: '2023-06-15', amount: 89.50, status: 'Processing' },
                            { id: 'ORD003', customer: 'Bob Johnson', date: '2023-06-14', amount: 199.99, status: 'Shipped' },
                            { id: 'ORD004', customer: 'Alice Brown', date: '2023-06-14', amount: 59.99, status: 'Delivered' },
                            { id: 'ORD005', customer: 'Charlie Wilson', date: '2023-06-13', amount: 149.99, status: 'Processing' },
                        ],
                        topProducts: [
                            { id: 'PRD001', name: 'Premium Face Cream', sales: 145, revenue: 4350.00 },
                            { id: 'PRD002', name: 'Anti-Aging Serum', sales: 132, revenue: 5280.00 },
                            { id: 'PRD003', name: 'Moisturizing Lotion', sales: 128, revenue: 2560.00 },
                            { id: 'PRD004', name: 'Sunscreen SPF 50', sales: 115, revenue: 2300.00 },
                            { id: 'PRD005', name: 'Night Recovery Cream', sales: 98, revenue: 2940.00 },
                        ],
                        monthlySales: [
                            { month: 'Jan', sales: 3200 },
                            { month: 'Feb', sales: 4100 },
                            { month: 'Mar', sales: 3800 },
                            { month: 'Apr', sales: 5200 },
                            { month: 'May', sales: 4900 },
                            { month: 'Jun', sales: 5600 },
                        ],
                        userGrowth: [
                            { month: 'Jan', users: 980 },
                            { month: 'Feb', users: 1020 },
                            { month: 'Mar', users: 1080 },
                            { month: 'Apr', users: 1150 },
                            { month: 'May', users: 1190 },
                            { month: 'Jun', users: 1234 },
                        ]
                    });
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Shipped':
                return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

    return (
        <div className="px-4 py-6 sm:px-0">
            {/* Welcome Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Welcome back, {session?.user?.name}. Here's what's happening with your store today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Users
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {dashboardData.totalUsers.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/dashboard/users" className="font-medium text-blue-700 hover:text-blue-600">
                                View all users
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Products
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {dashboardData.totalProducts.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/dashboard/products" className="font-medium text-blue-700 hover:text-blue-600">
                                View all products
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Orders
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {dashboardData.totalOrders.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/dashboard/manage-my-order" className="font-medium text-blue-700 hover:text-blue-600">
                                View all orders
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Revenue
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        ${dashboardData.totalRevenue.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link href="/dashboard/analytics" className="font-medium text-blue-700 hover:text-blue-600">
                                View analytics
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Sales</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {dashboardData.monthlySales.map((item, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-full bg-blue-500 rounded-t"
                                    style={{ height: `${(item.sales / Math.max(...dashboardData.monthlySales.map(s => s.sales))) * 100}%` }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {dashboardData.userGrowth.map((item, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-full bg-green-500 rounded-t"
                                    style={{ height: `${(item.users / Math.max(...dashboardData.userGrowth.map(u => u.users))) * 100}%` }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Latest orders from your customers
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboardData.recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <Link href={`/dashboard/manage-my-order/${order.id}`} className="text-blue-600 hover:text-blue-500">
                                                {order.id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.customer}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${order.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6">
                        <div className="text-sm">
                            <Link href="/dashboard/manage-my-order" className="font-medium text-blue-700 hover:text-blue-600">
                                View all orders
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Top Products</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Best-selling products this month
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sales
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboardData.topProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <Link href={`/dashboard/products/${product.id}`} className="text-blue-600 hover:text-blue-500">
                                                {product.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.sales}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${product.revenue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6">
                        <div className="text-sm">
                            <Link href="/dashboard/products" className="font-medium text-blue-700 hover:text-blue-600">
                                View all products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Common tasks you might want to perform
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link href="/dashboard/add-product" className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Product
                        </Link>
                        <Link href="/dashboard/coupons/add" className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            Create Coupon
                        </Link>
                        <Link href="/dashboard/users/add" className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Add User
                        </Link>
                        <Link href="/dashboard/settings" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;