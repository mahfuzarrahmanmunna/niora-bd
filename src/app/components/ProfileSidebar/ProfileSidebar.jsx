// app/account/components/ProfileSidebar.jsx
'use client';
import Link from 'next/link';
import Image from 'next/image';

const ProfileSidebar = ({ user, onLogout, currentPath }) => {
    const isActive = (path) => currentPath === path;

    return (
        <div className="w-64 bg-white shadow-xl h-full flex flex-col">
            {/* User Profile Section */}
            <div className="p-6 border-b">
                <div className="flex items-center space-x-4">
                    <Image
                        src={user.profileImage}
                        alt={user.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                    />
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2">
                <Link
                    href="/account/profile"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/account/profile')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 00-8 4 4 0 01-1 1V4a1 1 0 01-1 1H5.232a1 1 0 01-1 1v3.718a1 1 0 01-1 1H16.518a1 1 0 01-1 1v3.718a1 1 0 01-1 1z" />
                    </svg>
                    Profile Information
                </Link>

                <Link
                    href="/account/security"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/account/security')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v6m0 0v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Security
                </Link>

                <Link
                    href="/account/orders"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/account/orders')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v2a2 2 0 006 2h10a2 2 0 006 2v2a2 2 0 006 2H7a2 2 0 00-2 2z" />
                    </svg>
                    Order History
                </Link>

                <Link
                    href="/account/addresses"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/account/addresses')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657l-7.244-7.244 7.244-7.244M20.485 20.485a1 1 0 00-1.414-1.414L16.172 16.172a4 4 0 00-4 4 4 0 01-1 1H8a2 2 0 00-2 2v2a2 2 0 006 2z" />
                    </svg>
                    Address Book
                </Link>

                <Link
                    href="/account/wishlist"
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/account/wishlist')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.578a2 2 0 00-2 2v2a2 2 0 006 2h2a2 2 0 006 2z" />
                    </svg>
                    Wishlist
                </Link>
            </nav>

            {/* Logout Button */}
            <div className="p-4 mt-auto">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l10 5m0 0v6m0 0v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileSidebar;