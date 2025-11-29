"use client";
import React, { useRef, useState } from 'react';
import Link from 'next/link';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

// import required modules
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

export default function ImageSlider() {
    // Sample data for slides - replace with your actual data
    const slides = [
        { id: 1, image: 'https://picsum.photos/seed/slide1/800/400.jpg', link: '/products/1' },
        { id: 2, image: 'https://picsum.photos/seed/slide2/800/400.jpg', link: '/products/2' },
        { id: 3, image: 'https://picsum.photos/seed/slide3/800/400.jpg', link: '/products/3' },
        { id: 4, image: 'https://picsum.photos/seed/slide4/800/400.jpg', link: '/products/4' },
        { id: 5, image: 'https://picsum.photos/seed/slide5/800/400.jpg', link: '/products/5' },
    ];

    return (
        <div className="w-full h-[120px] md:h-[500px] lg:h-[600px]  my-4 bg-white rounded-2xl">
            <Swiper
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                modules={[Pagination, Navigation, Autoplay]}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                className="w-full h-full"
                loop={true}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id} className="relative">
                        <Link href={slide.link} className="block w-full h-full">
                            <img
                                src={slide.image}
                                alt={`Slide ${slide.id}`}
                                className="w-full h-full object-cover rounded-2xl"
                            />
                            <div className="absolute rounded-2xl inset-0 bg-gray-500/90 bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white text-gray-500/90 px-6 py-3 rounded-md font-semibold">
                                    View Product
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}