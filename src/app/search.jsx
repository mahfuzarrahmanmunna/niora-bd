// app/search/page.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const SearchResults = () => {
    const router = useRouter();
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (router.isReady && router.query.q) {
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
    }, [router.isReady, router.query]);

    if (!router.query.q) {
        return (
            <div className="p-4">
                <p className="text-center text-gray-500">Please enter a search query</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">
                Search Results for `{router.query.q}`
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

export default SearchResults;