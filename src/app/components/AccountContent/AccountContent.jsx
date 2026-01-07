// app/account/components/AccountContent.jsx
'use client';
import { useState, useEffect } from 'react';
import ProfileForm from './ProfileForm';
import SecuritySettings from './SecuritySettings';
import OrderHistory from './OrderHistory';
import AddressBook from './AddressBook';
import Wishlist from './Wishlist';

const AccountContent = ({ user, isLoading, message, setMessage, setIsLoading, setUser }) => {
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        // Set active tab based on current path
        const path = window.location.pathname;
        if (path.includes('/account/profile')) setActiveTab('profile');
        else if (path.includes('/account/security')) setActiveTab('security');
        else if (path.includes('/account/manage-my-order')) setActiveTab('orders');
        else if (path.includes('/account/addresses')) setActiveTab('addresses');
        else if (path.includes('/account/wishlist')) setActiveTab('wishlist');
    }, []);

    return (
        <div className="p-6">
            {/* Alert Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'profile' && (
                <ProfileForm
                    user={user}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setMessage={setMessage}
                    setUser={setUser}
                />
            )}

            {activeTab === 'security' && (
                <SecuritySettings
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setMessage={setMessage}
                />
            )}

            {activeTab === 'orders' && (
                <OrderHistory orders={user.orders} />
            )}

            {activeTab === 'addresses' && (
                <AddressBook
                    addresses={user.addresses}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setMessage={setMessage}
                    setUser={setUser}
                />
            )}

            {activeTab === 'wishlist' && (
                <Wishlist
                    wishlist={user.wishlist}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setMessage={setMessage}
                    setUser={setUser}
                />
            )}
        </div>
    );
};

export default AccountContent;