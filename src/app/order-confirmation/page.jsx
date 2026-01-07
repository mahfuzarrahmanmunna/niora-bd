// src/app/order-confirmation/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowLeft, Home } from "lucide-react";

const OrderConfirmationPage = () => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        if (!orderId) {
            router.push('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch(`/api/manage-my-order/${orderId}`);
                
                if (!response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('text/html')) {
                        throw new Error('Order not found');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Failed to fetch order with status ${response.status}`);
                    }
                }

                const data = await response.json();
                if (data.success) {
                    setOrder(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch order details.');
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.message || 'An unexpected error occurred while fetching your order.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, router]);

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
                        <p>{error || 'Order not found'}</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
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
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Order Confirmed!
                        </h1>
                        <p className="text-gray-600">
                            Your order has been successfully placed and will be delivered soon.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Order Details
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-medium">{order._id}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Order Date:</span>
                                <span className="font-medium">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium">
                                    {order.paymentMethod === 'cash_on_delivery' 
                                        ? 'Cash on Delivery' 
                                        : 'Online Payment'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="font-medium text-blue-600">
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Shipping Address
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p className="font-medium">{order.shippingAddress?.name || 'N/A'}</p>
                            <p className="text-gray-600">{order.shippingAddress?.address || 'N/A'}</p>
                            <p className="text-gray-600">
                                {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.country || 'N/A'}
                            </p>
                            <p className="text-gray-600">{order.shippingAddress?.phone || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Order Summary
                        </h2>
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="text-gray-600">
                                        {item.name} x {item.quantity}
                                    </span>
                                    <span className="font-medium">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold text-gray-900">
                                        Total
                                    </span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        ${order.totalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="flex-1 flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Home className="h-5 w-5 mr-2" />
                            Back to Home
                        </button>
                        <button
                            onClick={() => router.push('/products')}
                            className="flex-1 flex justify-center items-center px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;