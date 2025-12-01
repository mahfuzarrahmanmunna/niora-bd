// app/account/wishlist/page.jsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const WishlistPage = () => {
    const [message, setMessage] = useState({ type: '', text: '' });

    // Mock user data - in a real app, this would come from an API
    const [user, setUser] = useState({
        wishlist: [
            { id: 'COS025', name: 'Sunscreen Lotion SPF 50', price: 19.54, image: 'https://picsum.photos/seed/COS025/200/200.jpg' },
            { id: 'COS001', name: 'Hydrating Face Cream', price: 24.99, image: 'https://picsum.photos/seed/COS001/200/200.jpg' },
        ]
    });

    useEffect(() => {
        // In a real app, fetch user data here
        // fetchUserData().then(data => setUser(data));
    }, []);

    const handleRemoveFromWishlist = (id) => {
        setUser(prev => ({ ...prev, wishlist: prev.wishlist.filter(item => item.id !== id) }));
        setMessage({ type: 'success', text: 'Item removed from wishlist.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleAddToCart = (id) => {
        // In a real app, this would add the item to the cart
        setMessage({ type: 'success', text: 'Item added to cart.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href="/account" className="text-blue-600 hover:text-blue-800">
                    ← Back to Account
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

            {/* Alert Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                {user.wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {user.wishlist.map(item => (
                            <div key={item.id} className="border rounded-lg p-4">
                                <Image src={item.image} alt={item.name} width={150} height={150} className="object-cover rounded mb-4" />
                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                <p className="text-gray-900 font-semibold">${item.price.toFixed(2)}</p>
                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={() => handleAddToCart(item.id)}
                                        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFromWishlist(item.id)}
                                        className="w-full py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-600 mb-6">Add items to your wishlist to keep track of products you like</p>
                        <Link href="/products" className="inline-block py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Browse Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;