"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { cartItems: contextCartItems, setCartItems: setContextCartItems } =
    useCart();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // New State for Shipping Location
  const [shippingLocation, setShippingLocation] = useState("inside"); // 'inside' or 'outside'

  const router = useRouter();
  const hasFetchedRef = useRef(false);

  // Helper function to safely format price
  const formatPrice = (price) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  // Get or create user ID
  const getUserId = () => {
    if (typeof window === "undefined") return null;
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = "guest-" + Date.now();
      localStorage.setItem("userId", userId);
    }
    return userId;
  };

  // Get cart from localStorage
  const getLocalCart = () => {
    if (typeof window === "undefined") return [];
    const cart = localStorage.getItem("cart");
    if (!cart) return [];
    try {
      return JSON.parse(cart);
    } catch {
      return [];
    }
  };

  // Save cart to localStorage
  const saveLocalCart = (cart) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  // Find product by ID
  const findProduct = (products, productId) => {
    return products.find(
      (p) =>
        p._id === productId ||
        p.id === productId ||
        p._id?.toString() === productId ||
        p.id?.toString() === productId ||
        p.name === productId ||
        p.slug === productId,
    );
  };

  useEffect(() => {
    const loadCart = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        setIsLoading(true);
        setError(null);

        const localCart = getLocalCart();

        if (localCart.length === 0) {
          setCartItems([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/products");
        let allProducts = [];
        if (response.ok) {
          const data = await response.json();
          allProducts = data.data || [];
        }

        const cartWithProducts = localCart
          .map((cartItem) => {
            const product = findProduct(allProducts, cartItem.productId);
            return {
              ...cartItem,
              product: product || null,
            };
          })
          .filter((item) => item.product !== null);

        setCartItems(cartWithProducts);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading cart:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(productId);
      return;
    }

    try {
      setIsUpdating(true);

      const localCart = getLocalCart();
      const updatedCart = localCart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              updatedAt: new Date().toISOString(),
            }
          : item,
      );
      saveLocalCart(updatedCart);

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );

      if (setContextCartItems) {
        setContextCartItems(updatedCart);
      }

      const userId = getUserId();
      if (userId) {
        fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId, quantity: newQuantity }),
        }).catch((err) => console.error("API sync error:", err));
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      alert("Failed to update cart");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      setIsUpdating(true);

      const localCart = getLocalCart();
      const updatedCart = localCart.filter(
        (item) => item.productId !== productId,
      );
      saveLocalCart(updatedCart);

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.productId !== productId),
      );

      if (setContextCartItems) {
        setContextCartItems(updatedCart);
      }

      const userId = getUserId();
      if (userId) {
        fetch(`/api/cart?userId=${userId}&productId=${productId}`, {
          method: "DELETE",
        }).catch((err) => console.error("API sync error:", err));
      }

      // Force reload to ensure Navbar and state are fully synced as requested
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate Subtotal
  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => {
        const price = parseFloat(
          item.product?.finalPrice || item.product?.price || 0,
        );
        return total + (isNaN(price) ? 0 : price) * item.quantity;
      }, 0)
      .toFixed(2);
  };

  // Calculate Shipping Cost based on location and max item shipping
  const calculateShippingCost = () => {
    if (cartItems.length === 0) return 0;

    let maxShipping = 0;
    cartItems.forEach((item) => {
      const product = item.product;
      if (product && product.shipping) {
        const cost =
          shippingLocation === "inside"
            ? parseFloat(product.shipping.insideDhaka) || 0
            : parseFloat(product.shipping.outsideDhaka) || 0;

        // Logic: Usually you pay the highest shipping cost in the cart for the whole order
        if (cost > maxShipping) {
          maxShipping = cost;
        }
      }
    });
    return maxShipping;
  };

  // Grand Total
  const grandTotal = (
    parseFloat(calculateSubtotal()) + calculateShippingCost()
  ).toFixed(2);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);

      if (cartItems.length === 0) {
        alert("Your cart is empty");
        return;
      }

      const userId = getUserId();

      const requestData = {
        userId,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.finalPrice || item.product?.price || 0,
        })),
        // Add shipping info to order
        shipping: {
          location: shippingLocation,
          cost: calculateShippingCost(),
        },
        totalAmount: grandTotal,
      };

      const response = await fetch("/api/manage-my-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      // Clear cart
      saveLocalCart([]);
      if (setContextCartItems) {
        setContextCartItems([]);
      }

      router.push(`/payment?orderId=${data.data._id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <button
              onClick={() => {
                hasFetchedRef.current = false;
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            >
              Try Again
            </button>
            <Link
              href="/all-products"
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you have not added any products to your cart yet.
            </p>
            <Link
              href="/all-products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                Cart Items ({cartItems.length})
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <Image
                        // UPDATED: Checks 'images' array first (matching your JSON), then fallbacks
                        src={
                          item.product?.images?.[0] ||
                          item.product?.imageUrls?.[0] ||
                          item.product?.imageUrl ||
                          `https://picsum.photos/seed/${item.productId}/200/200.jpg`
                        }
                        alt={item.product?.name || "Product"}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <Link
                        href={`/product/${item.productId}`}
                        className="text-lg font-medium hover:text-blue-600"
                      >
                        {item.product?.name || "Product"}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {item.product?.brand}
                      </p>
                      <div className="flex items-center mt-2">
                        {item.product?.discount > 0 ? (
                          <>
                            <span className="font-bold">
                              ৳{formatPrice(item.product.finalPrice)}
                            </span>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ৳{formatPrice(item.product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold">
                            ৳{formatPrice(item.product?.price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={isUpdating}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          disabled={isUpdating}
                          className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{calculateSubtotal()}</span>
                </div>

                {/* Shipping Location Selector */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Area
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="shippingLocation"
                        value="inside"
                        checked={shippingLocation === "inside"}
                        onChange={(e) => setShippingLocation(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Inside Dhaka
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="shippingLocation"
                        value="outside"
                        checked={shippingLocation === "outside"}
                        onChange={(e) => setShippingLocation(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Outside Dhaka
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-gray-600">Shipping Cost</span>
                  <span className="font-medium">
                    ৳{calculateShippingCost().toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-lg text-blue-600">
                      ৳{grandTotal}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || isUpdating}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Fast Delivery</h4>
                    <p className="text-xs text-gray-600">
                      Reliable delivery across Bangladesh
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Secure Payment</h4>
                    <p className="text-xs text-gray-600">
                      100% secure payment gateways
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <RefreshCw className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Easy Returns</h4>
                    <p className="text-xs text-gray-600">7-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
