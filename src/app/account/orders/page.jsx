// app/account/orders/page.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const OrdersPage = () => {
    // Mock user data - in a real app, this would come from an API
    const [user, setUser] = useState({
        orders: [
            { id: 'ORD123', date: '2023-11-20', status: 'Delivered', total: 54.99, items: ['Product A', 'Product B'] },
            { id: 'ORD124', date: '2023-11-15', status: 'Shipped', total: 29.99, items: ['Product C'] },
        ],
    });

    useEffect(() => {
        // In a real app, fetch user data here
        // fetchUserData().then(data => setUser(data));
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href="/account" className="text-blue-600 hover:text-blue-800">
                    ← Back to Account
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="space-y-4">
                    {user.orders.map(order => (
                        <div key={order.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-gray-900">Order ID: {order.id}</h3>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Date: {order.date}</p>
                            <p className="text-sm text-gray-600">Total: ${order.total.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Items: {order.items.join(', ')}</p>
                            <div className="mt-3">
                                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                    View Order Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;