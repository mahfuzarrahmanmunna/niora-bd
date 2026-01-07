// src/app/payment/fail/page.jsx
"use client";
import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

const PaymentFailPage = () => {
    const router = useRouter();

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Payment Failed
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Unfortunately, your payment could not be processed. Please try again.
                        </p>
                        
                        <div className="bg-gray-50 p-6 rounded-md mb-8">
                            <h3 className="font-medium text-gray-900 mb-3">What to do next?</h3>
                            <ul className="text-left text-gray-600 space-y-2">
                                <li>• Check your payment details and try again</li>
                                <li>• Contact your bank if there's an issue with your card</li>
                                <li>• Try a different payment method</li>
                                <li>• Contact our support team if the problem persists</li>
                            </ul>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => router.back()}
                                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 font-medium flex items-center justify-center"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Go Back
                            </button>
                            <button
                                onClick={() => router.push('/cart')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium flex items-center justify-center"
                            >
                                <RefreshCw className="h-5 w-5 mr-2" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailPage;