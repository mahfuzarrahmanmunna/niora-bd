"use client";
import React, { useEffect, useState } from 'react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    console.log(categories);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('./data.json');
                const data = await res.json();
                // console.log(data);
                setCategories(data);
            }
            catch (error) {
                console.error('Error fetching categories:', error);
            }
        }
        fetchCategories();
    }, [])
    return (
        <div>
            <h1>Category Page</h1>
        </div>
    );
};

export default Categories;