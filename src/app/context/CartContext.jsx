// context/CartContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setLoading(false);
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const getGuestId = () => {
    if (typeof window === "undefined") return null;
    let guestId = localStorage.getItem("guestUserId");
    if (!guestId) {
      guestId =
        "guest-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("guestUserId", guestId);
    }
    return guestId;
  };

  const addToCart = async (product, quantity) => {
    const userId = session?.user?.id || session?.user?._id || getGuestId();
    const productId = product._id || product.id;

    // 1. Update Local State immediately (for UI reactivity)
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === productId,
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [
          ...prevItems,
          {
            productId,
            quantity,
            name: product.name,
            price: product.finalPrice || product.price,
            image: product.imageUrls?.[0] || product.imageUrl,
          },
        ];
      }
    });

    // 2. Sync with Backend API
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync cart with server");
        // Optional: revert local state if API fails
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, cartCount, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
