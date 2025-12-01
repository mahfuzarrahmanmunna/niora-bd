"use client";
import React, { useRef, useState } from 'react';
import Link from 'next/link';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

export default function ImageSlider() {
    // Enhanced sample data for slides with title and description
    const slides = [
        { id: 1, image: 'https://picsum.photos/seed/slide1/1920/1080.jpg', link: '/products/1', title: 'New Summer Collection', description: 'Discover the latest trends for the sunny season.' },
        { id: 2, image: 'https://picsum.photos/seed/slide2/1920/1080.jpg', link: '/products/2', title: 'Tech Gadgets Galore', description: 'Find the perfect gadget to upgrade your life.' },
        { id: 3, image: 'https://picsum.photos/seed/slide3/1920/1080.jpg', link: '/products/3', title: 'Home & Living Essentials', description: 'Transform your space into a sanctuary.' },
        { id: 4, image: 'https://picsum.photos/seed/slide4/1920/1080.jpg', link: '/products/4', title: 'Exclusive Member Deals', description: 'Save big on your favorite brands. Members only!' },
        { id: 5, image: 'https://picsum.photos/seed/slide5/1920/1080.jpg', link: '/products/5', title: 'The Ultimate Outdoor Gear', description: 'Gear up for your next adventure with us.' },
    ];

    return (
        // The main container now includes CSS variables for customizing Swiper's appearance.
        <div
            className="w-full md:mt-18 h-[250px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-xl"
            style={{
                '--swiper-navigation-color': '#fff',
                '--swiper-pagination-color': '#fff',
                '--swiper-pagination-bullet-inactive-color': '#ffffff99',
                '--swiper-pagination-bullet-inactive-opacity': '1',
            }}
        >
            <Swiper
               
                navigation={true}
                // modules={[Pagination, Navigation, Autoplay]}
                autoplay={{
                    delay: 4000, // Slightly longer delay for reading text
                    disableOnInteraction: false,
                }}
                className="w-full h-full"
                loop={true}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id} className="relative">
                        <img
                            src={slide.image}
                            alt={`Slide ${slide.id}`}
                            className="w-full h-full object-cover"
                        />
                        {/* Professional Content Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-end p-6 md:p-10">
                            <div className="text-white max-w-lg">
                                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                                    {slide.title}
                                </h2>
                                <p className="text-sm md:text-base lg:text-lg mb-4 drop-shadow-md">
                                    {slide.description}
                                </p>
                                <Link
                                    href={slide.link}
                                    className="inline-block bg-white text-gray-900 font-semibold px-6 py-2 md:py-3 rounded-md hover:bg-gray-100 transition-colors duration-300"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}