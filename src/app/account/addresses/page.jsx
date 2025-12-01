// app/account/addresses/page.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const AddressesPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Mock user data - in a real app, this would come from an API
    const [user, setUser] = useState({
        addresses: [
            { id: 1, type: 'Home', street: '123 Main St', city: 'Anytown', zip: '12345', country: 'USA', isDefault: true },
            { id: 2, type: 'Work', street: '456 Office Blvd', city: 'Otherville', zip: '67890', country: 'USA', isDefault: false },
        ],
    });

    const [addressForm, setAddressForm] = useState({
        street: '',
        city: '',
        zip: '',
        country: '',
        type: 'Home'
    });

    useEffect(() => {
        // In a real app, fetch user data here
        // fetchUserData().then(data => setUser(data));
    }, []);

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const newAddress = { ...addressForm, id: Date.now() }; // simple unique id
        setUser(prev => ({ ...prev, addresses: [...prev.addresses, newAddress] }));
        setIsLoading(false);
        setAddressForm({ street: '', city: '', zip: '', country: '', type: 'Home' });
        setMessage({ type: 'success', text: 'Address added successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleDeleteAddress = (id) => {
        setUser(prev => ({ ...prev, addresses: prev.addresses.filter(addr => addr.id !== id) }));
        setMessage({ type: 'success', text: 'Address deleted.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleSetDefault = (id) => {
        setUser(prev => ({
            ...prev,
            addresses: prev.addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === id
            }))
        }));
        setMessage({ type: 'success', text: 'Default address updated.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href="/account" className="text-blue-600 hover:text-blue-800">
                    ← Back to Account
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Address Book</h1>

            {/* Alert Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Add New Address Form */}
                <div className="mb-8 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Add New Address</h3>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={addressForm.type}
                                onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                            >
                                <option>Home</option>
                                <option>Work</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Street Address</label>
                            <input
                                type="text"
                                value={addressForm.street}
                                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                <input
                                    type="text"
                                    value={addressForm.zip}
                                    onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    value={addressForm.country}
                                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Adding...' : 'Add Address'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddressForm({ street: '', city: '', zip: '', country: '', type: 'Home' })}
                                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Saved Addresses */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-4">Saved Addresses</h3>
                    {user.addresses.map(address => (
                        <div key={address.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{address.type}</p>
                                    <p className="text-sm text-gray-600">{address.street}</p>
                                    <p className="text-sm text-gray-600">{address.city}, {address.zip}, {address.country}</p>
                                    {address.isDefault && <span className="text-xs font-semibold text-blue-600">Default</span>}
                                </div>
                                <div className="flex gap-2">
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address.id)}
                                            className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                                        >
                                            Set as Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteAddress(address.id)}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddressesPage;