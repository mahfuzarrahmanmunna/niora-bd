// app/search/page.js
'use client'; // Required for client components in App Router

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const SearchResults = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (query) {
            // Here you would typically make an API call to fetch search results
            // For now, we'll just simulate it with a timeout
            setIsLoading(true);

            setTimeout(() => {
                // Replace this with your actual search logic
                setSearchResults([
                    { id: 1, name: 'Product 1', price: '$19.99' },
                    { id: 2, name: 'Product 2', price: '$29.99' },
                    { id: 3, name: 'Product 3', price: '$39.99' },
                ]);
                setIsLoading(false);
            }, 1000);
        }
    }, [query]);

    if (!query) {
        return (
            <div className="p-4">
                <p className="text-center text-gray-500">Please enter a search query</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">
                Search Results for `{query}`
            </h1>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                    {searchResults.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-gray-600">{product.price}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No results found</p>
            )}
        </div>
    );
};

// Wrap the component in Suspense
import { Suspense } from 'react';

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div></div>}>
            <SearchResults />
        </Suspense>
    );
}