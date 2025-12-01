// app/account/profile/page.jsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ProfilePage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Mock user data - in a real app, this would come from an API
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        profileImage: 'https://picsum.photos/seed/user123/200/200.jpg',
    });

    // Form states
    const [profileForm, setProfileForm] = useState({ ...user });

    useEffect(() => {
        // In a real app, fetch user data here
        // fetchUserData().then(data => setUser(data));
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser(prev => ({ ...prev, ...profileForm }));
        setIsLoading(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileForm(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link href="/account" className="text-blue-600 hover:text-blue-800">
                    ← Back to Account
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Information</h1>

            {/* Alert Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="max-w-2xl mx-auto">
                    <p className="text-gray-600 mb-6">Manage your personal information and update your profile details here.</p>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        {/* Profile Image */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                            <div className="flex-shrink-0">
                                <Image src={profileForm.profileImage} alt="Profile" width={150} height={150} className="rounded-full object-cover border-4 border-gray-200" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="profileImageUpload" className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="profileImageUpload"
                                        accept="image/*"
                                        onChange={handleProfileImageChange}
                                        className="hidden"
                                    />
                                    <label htmlFor="profileImageUpload" className="cursor-pointer flex items-center px-4 py-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.396 3.396m0 5.887-3.396 3.396-5.887 0-5.887-3.396 3.396v6.718a1 1 0 01-1 1v3.718a1 1 0 01-1 1H5.232a1 1 0 01-1-1V8.532a1 1 0 01-1-1z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a3 3 0 00-3 3v6a3 3 0 003 3h6a3 3 0 003-3v-6a3 3 0 00-3-3z" />
                                        </svg>
                                        Upload New Photo
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setProfileForm({ ...user })}
                                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;