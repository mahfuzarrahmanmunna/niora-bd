"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// --- FIXED IMPORTS ---
// Make sure these file paths match the actual files in your assets folder
import acce from "./assets/acce.png";
import cloth from "./assets/cloth.png";
import beauty from "./assets/beauty.png";
import electronics from "./assets/electronics.png";
import others from "./assets/others.png";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Pagination, Navigation, Autoplay } from "swiper/modules";

export default function ImageSlider() {
  // --- SET YOUR TIME HERE (in milliseconds) ---
  const SLIDE_DURATION = 2000;

  // Your Categories
  const categories = [
    { value: "cosmetics", label: "Cosmetics" },
    { value: "clothing", label: "Clothing" },
    { value: "shoes", label: "Shoes" },
    { value: "blankets", label: "Blankets" },
    { value: "accessories", label: "Accessories" },
    { value: "electronics", label: "Electronics" }, // Added because you imported the image
    { value: "other", label: "Other" },
  ];

  // Mapping Categories to Images and Links
  const slides = categories.map((cat) => {
    let selectedImage = others; // Default fallback image

    // Map specific category values to your imported assets
    if (cat.value === "cosmetics") selectedImage = beauty;
    else if (cat.value === "clothing") selectedImage = cloth;
    else if (cat.value === "accessories") selectedImage = acce;
    else if (cat.value === "electronics") selectedImage = electronics;
    // 'shoes', 'blankets', and 'other' will use the 'others' image automatically

    return {
      id: cat.value,
      title: cat.label,
      description: `Explore our latest ${cat.label} collection.`,
      // Use .src because we are using a standard <img> tag in Next.js
      image: selectedImage.src,
      // Create the link format you requested: /products?category=accessories
      link: `/products?category=${cat.value}`,
    };
  });

  return (
    <>
      <div
        className="w-full h-[250px] md:h-[500px] lg:h-[650px] rounded-2xl overflow-hidden shadow-xl relative"
        style={{
          "--swiper-pagination-color": "#fff",
          "--swiper-pagination-bullet-inactive-color": "#ffffff99",
          "--swiper-pagination-bullet-inactive-opacity": "1",
        }}
      >
        <Swiper
          navigation={false}
          pagination={{
            clickable: true, // Enabled clickable bullets
            dynamicBullets: false,
          }}
          modules={[Pagination, Navigation, Autoplay]}
          autoplay={{
            delay: SLIDE_DURATION,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="w-full h-full"
          loop={true}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative group">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-end p-6 md:p-10 z-10">
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
    </>
  );
}
