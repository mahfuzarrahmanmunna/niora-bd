"use client";
import React from "react";

const WhatsAppButton = () => {
  // Your phone number without the '+' sign, spaces, or dashes
  // Original: +880 1763-297720 -> Formatted: 8801763297720
  const phoneNumber = "8801518997176";

  // Optional: Default message when the user clicks the link
  const message = "Hello! I have a question about your products.";

  const handleClick = () => {
    // Create the WhatsApp URL
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open in a new tab
    window.open(url, "_blank");
  };

  return (
    <div
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 p-4 rounded-full shadow-lg cursor-pointer hover:bg-green-600 transition-all duration-300 hover:scale-110 animate-bounce"
      aria-label="Chat on WhatsApp"
    >
      {/* WhatsApp SVG Icon */}
      <svg
        viewBox="0 0 32 32"
        className="w-7 h-7 fill-current text-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.925 15.925 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.32 22.614c-.396 1.116-1.958 2.042-3.19 2.312-.842.18-1.94.322-5.658-1.214-4.752-1.96-7.818-6.77-8.052-7.082-.226-.312-1.924-2.562-1.924-4.89s1.2-3.474 1.626-3.95c.396-.44 1.056-.64 1.696-.64.208 0 .396.01.566.018.496.022.744.052 1.072.832.404.96 1.384 3.3 1.502 3.544.12.244.24.574.072.916-.156.332-.294.48-.54.762-.244.282-.476.498-.72.796-.224.26-.478.538-.196 1.016.282.47 1.258 2.01 2.702 3.262 1.856 1.61 3.416 2.11 3.884 2.344.396.198.876.166 1.172-.114.372-.35.828-.928 1.292-1.5.332-.422.752-.474 1.192-.316.448.154 2.818 1.328 3.31 1.57.49.242.814.358.934.562.118.2.118 1.168-.278 2.284z" />
      </svg>
    </div>
  );
};

export default WhatsAppButton;
