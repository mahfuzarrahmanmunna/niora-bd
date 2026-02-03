// components/CategoriesSection.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/products");
        const data = await response.json();

        if (data.success && data.data) {
          const products = data.data || [];
          const uniqueCategories = [
            ...new Set(
              products
                .map((product) => product.category)
                .filter((category) => category && typeof category === "string"),
            ),
          ];
          setCategories(uniqueCategories);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("An error occurred while fetching categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-4">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Shop by Category
      </h2>

      <div className="relative w-full">
        <div
          className="flex overflow-x-auto space-x-4 pb-4 scroll-smooth"
          style={{ scrollbarWidth: "auto" }}
        >
          {categories.map((category, index) => (
            <Link
              href={`/products?category=${category.toLowerCase()}`}
              key={index}
              className="flex-shrink-0 group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
              style={{ width: "140px", height: "140px" }}
            >
              <div className="bg-gradient-to-r from-purple-400 to-indigo-600 h-full w-full flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-white text-xl font-semibold capitalize group-hover:scale-110 transition-transform duration-300">
                    {category}
                  </h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default CategoriesSection;
