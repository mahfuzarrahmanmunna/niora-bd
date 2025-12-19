"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const DashboardLayout = ({ children }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Check if device is mobile and handle sidebar state
    useEffect(() => {
        const checkDevice = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // Close sidebar on desktop view
            if (!mobile) {
                setSidebarOpen(false);
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Redirect non-admin users
    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/sign-in');
            return;
        }

        if (session.user?.role !== 'admin') {
            router.push('/user-dashboard');
            return;
        }
    }, [session, status, router]);

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-600 border-solid rounded-full animate-spin border-t-transparent"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-blue-200 border-solid rounded-full animate-ping"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    // If not admin, don't render anything (redirect will happen in useEffect)
    if (!session || session.user?.role !== 'admin') {
        return null;
    }

    const navigation = [
        { 
            name: 'Dashboard', 
            href: '/dashboard', 
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 011 1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
        },
        { 
            name: 'Products', 
            href: '/dashboard/manage-products', 
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' 
        },
        { 
            name: 'Add Product', 
            href: '/dashboard/add-product', 
            icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' 
        },
        { 
            name: 'Categories', 
            href: '/dashboard/manage-categories', 
            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' 
        },
        { 
            name: 'Orders', 
            href: '/dashboard/orders', 
            icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' 
        },
        { 
            name: 'Users', 
            href: '/dashboard/users', 
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
        },
        { 
            name: 'Analytics', 
            href: '/dashboard/analytics', 
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' 
        },
        { 
            name: 'Settings', 
            href: '/dashboard/settings', 
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' 
        },
    ];

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

    return (
        <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
                    <div className="absolute inset-0 bg-gray-900 opacity-75 transition-opacity"></div>
                </div>
            )}

            {/* LEFT SIDEBAR - Fixed position */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 xl:w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 overflow-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    {/* Logo */}
                    <div className={`flex items-center h-16 px-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                        <Link href="/dashboard" className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${darkMode ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                    </svg>
                                </div>
                            </div>
                            <span className={`ml-3 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Panel</span>
                        </Link>
                    </div>

                    {/* User Info */}
                    <div className={`px-6 py-5 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                        <div className="flex items-center">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
                                <AvatarFallback className="bg-blue-600 text-white font-bold">
                                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 flex-1">
                                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{session?.user?.name}</p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{session?.user?.email}</p>
                                <div className="flex items-center mt-1 space-x-2">
                                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                                    <div className="relative">
                                        <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NAVIGATION LINKS */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    pathname === item.href
                                        ? darkMode
                                            ? "bg-blue-900 text-blue-200 shadow-md"
                                            : "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm"
                                        : darkMode
                                            ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <svg className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    pathname === item.href ? "text-blue-600" : darkMode ? "text-gray-400" : "text-gray-500"
                                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                </svg>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* BOTTOM ACTIONS */}
                    <div className={`px-4 py-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t mt-auto`}>
                        <div className="space-y-2">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={cn(
                                    "group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    darkMode
                                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <svg className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {darkMode ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 2.646c-.08.08-.16.132-.242.132l-5.657 5.657a1.5 1.5 0 01-2.121 0l-5.657-5.657c-.09.09-.152.162-.242.242a9 9 0 00-12.708 12.708c.09.08.162.152.242.242l5.657 5.657a1.5 1.5 0 002.121 0l5.657 5.657c.09.09.152.162.242.242zM12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
                                    )}
                                </svg>
                                <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            </button>
                            
                            <Separator className={darkMode ? "bg-gray-700" : "bg-gray-200"} />
                            
                            <Link
                                href="/"
                                className={cn(
                                    "group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    darkMode
                                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <svg className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span className="font-medium">Back to Site</span>
                            </Link>
                            
                            <button
                                onClick={handleSignOut}
                                className={cn(
                                    "group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    darkMode
                                        ? "text-red-400 hover:bg-red-900 hover:text-red-200"
                                        : "text-red-600 hover:bg-red-50 hover:text-red-900"
                                )}
                            >
                                <svg className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    darkMode ? "text-red-400" : "text-red-600"
                                )} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Mobile Top Bar */}
                <header className={cn(
                    "flex items-center justify-between h-16 px-4 border-b shadow-sm",
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
                    "lg:hidden"
                )}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={cn(
                            "rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all",
                            darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
                        )}
                    >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className={cn("text-lg font-medium", darkMode ? "text-white" : "text-gray-900")}>Admin Dashboard</h1>
                </header>

                {/* Page Content */}
                <main className={cn(
                    "flex-1 overflow-y-auto",
                    darkMode ? "bg-gray-900" : "bg-gray-50"
                )}>
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Page Header - Desktop only */}
                            <div className="hidden lg:block mb-8">
                                <div className={cn(
                                    "rounded-xl shadow-lg p-6 border",
                                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-gray-900")}>Admin Dashboard</h1>
                                            <p className={cn("mt-2", darkMode ? "text-gray-300" : "text-gray-600")}>
                                                Welcome back, {session?.user?.name}. Here's what's happening with your store today.
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge variant="secondary" className="text-xs">
                                                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* The actual page content will be rendered here */}
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;