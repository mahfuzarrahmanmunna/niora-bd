// app/account/page.jsx
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const MyAccountPage = () => {
    const router = useRouter();
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleLogout = () => {
        // Simulate logout API call
        console.log('Logging out...');
        router.push('/sign-in');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

            {/* Alert Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>

                        <a href="/account/profile" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-medium text-gray-900">Profile Information</h3>
                            <p className="text-sm text-gray-600 mt-1">Manage your personal information and profile details</p>
                        </a>

                        <a href="/account/security" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-medium text-gray-900">Security Settings</h3>
                            <p className="text-sm text-gray-600 mt-1">Update your password and security preferences</p>
                        </a>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Shopping</h2>

                        <a href="/account/manage-my-order" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-medium text-gray-900">Order History</h3>
                            <p className="text-sm text-gray-600 mt-1">View your past orders and track current ones</p>
                        </a>

                        <a href="/account/addresses" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-medium text-gray-900">Address Book</h3>
                            <p className="text-sm text-gray-600 mt-1">Manage your shipping and billing addresses</p>
                        </a>

                        <a href="/account/wishlist" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <h3 className="font-medium text-gray-900">My Wishlist</h3>
                            <p className="text-sm text-gray-600 mt-1">View and manage your saved items</p>
                        </a>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyAccountPage;