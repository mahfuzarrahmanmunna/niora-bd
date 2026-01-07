// app/checkout/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, CreditCard, Truck, Shield, ArrowLeft, Check, AlertCircle } from 'lucide-react';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh'
  });
  const [paymentMethod, setPaymentMethod] = useState('sslcommerz');
  const [order, setOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = localStorage.getItem('userId') || 'guest-user';
        
        const response = await fetch(`/api/cart?userId=${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch cart');
        }
        
        if (data.success && data.data) {
          setCart(data.data);
        } else {
          setCart({ items: [], totalPrice: 0 });
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShippingInfo = () => {
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone || 
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleCreateOrder = async () => {
    if (!validateShippingInfo()) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userId') || 'guest-user';
      
      // Create order first
      const orderResponse = await fetch('/api/manage-my-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          items: cart.items,
          shippingAddress: shippingInfo
        }),
      });

      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      if (!orderData.success || !orderData.data || !orderData.data._id) {
        throw new Error('Invalid order data received');
      }

      setOrder(orderData.data);
      setStep(2); // Move to payment step
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Initialize SSLCommerz payment
      const paymentResponse = await fetch('/api/sslcommerz/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order._id,
          amount: cart.totalPrice,
          customerInfo: shippingInfo
        }),
      });

      const paymentData = await paymentResponse.json();
      
      if (!paymentResponse.ok || !paymentData.success) {
        throw new Error(paymentData.message || 'Failed to initialize payment');
      }

      // Redirect to SSLCommerz payment page
      window.location.href = paymentData.paymentUrl;
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => router.push('/cart')}
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Add some products to your cart before checking out</p>
          <button
            onClick={() => router.push('/products')}
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                {step > 1 ? <Check className="h-4 w-4" /> : 1}
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                {step > 2 ? <Check className="h-4 w-4" /> : 2}
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={shippingInfo.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateOrder}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Continue to Payment'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="sslcommerz"
                        name="paymentMethod"
                        value="sslcommerz"
                        checked={paymentMethod === 'sslcommerz'}
                        onChange={() => setPaymentMethod('sslcommerz')}
                        className="mr-3"
                      />
                      <label htmlFor="sslcommerz" className="cursor-pointer flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        SSLCommerz (Secure Payment)
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 ml-8">
                      Pay securely with SSLCommerz using your credit card, mobile banking, or other payment options.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Pay with SSLCommerz'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Order Created Successfully!</h2>
                  <p className="text-gray-600 mb-6">
                    Your order has been created and you will be redirected to the payment page shortly.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block">
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono font-bold">{order._id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/100/100.jpg`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="h-4 w-4 mr-2" />
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure payment with SSLCommerz
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;