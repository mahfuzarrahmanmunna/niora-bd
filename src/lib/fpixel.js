// src/lib/fpixel.js

export const FB_PIXEL_ID = "1447847387033366";

export const fbq = (...args) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
};
