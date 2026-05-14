"use client";
import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Import required modules
import { Pagination, Navigation, Autoplay } from "swiper/modules";

export default function ImageSlider() {
  const SLIDE_DURATION = 2000;

  const slides = [
    {
      id: "cosmetics",
      title: "Cosmetics",
      description: "Explore our latest Cosmetics collection.",
      image: "/gallery1.jpeg",
      link: "/products?category=cosmetics",
    },
    {
      id: "clothing",
      title: "Clothing",
      description: "Explore our latest Clothing collection.",
      image: "/gallery2.jpeg",
      link: "/products?category=clothing",
    },
    {
      id: "shoes",
      title: "Shoes",
      description: "Explore our latest Shoes collection.",
      image: "/gallery3.jpeg",
      link: "/products?category=shoes",
    },
  ];

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
            clickable: true,
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
