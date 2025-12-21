"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Loader, ArrowLeft } from "lucide-react";

const PaymentPage = () => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Bangladesh',
    });

    useEffect(() => {
        // If there's no order ID, redirect back to cart
        if (!orderId) {
            router.push('/cart');
            return;
        }

        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                setError(null); // Reset any previous errors
                
                // Call the new API endpoint to fetch order details
                const response = await fetch(`/api/orders/${orderId}`);
                
                if (!response.ok) {
                    // Check if the response is HTML (404 page) or JSON with an error
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('text/html')) {
                        // It's an HTML error page, likely a 404
                        throw new Error('Order not found');
                    } else {
                        // It's JSON, try to parse the error
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
                setError(err.message || 'An unexpected error occurred while fetching your order. Please try again.');
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
        setError(null); // Reset any previous errors

        try {
            const response = await fetch('/api/sslcommerz/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order._id,
                    amount: order.totalPrice,
                    customerInfo: customerInfo,
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Redirect to SSLCommerz payment gateway
                window.location.href = data.paymentUrl;
            } else {
                throw new Error(data.message || 'Payment initiation failed.');
            }
        } catch (err) {
            console.error('Error initiating payment:', err);
            setError(err.message || 'Failed to initiate payment. Please check your information and try again.');
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

    // If there's a critical error (like no order found), show an error screen
    if (error && !order) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="max-w-md mx-auto px-4 py-8 text-center">
                    <div className="bg-red-100 text-red-600 p-6 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">Error</h2>
                        <p>{error}</p>
                    </div>
                    <button
                        onClick={() => router.push('/cart')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Back to Cart
                    </button>
                </div>
            </div>
        );
    }

    // If the order is loaded, show the payment form
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/cart')}
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
                            Total Amount: ${order ? order.totalPrice.toFixed(2) : '0.00'}
                        </p>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
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
                        
                        {/* Display any payment initiation errors here */}
                        {error && <p className="text-red-500">{error}</p>}

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
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Pay with SSLCommerz
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