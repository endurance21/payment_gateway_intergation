import React, { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import axios from 'axios';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/products`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setCheckoutLoading(true);
    try {
      const totalAmount = getTotalPrice();
      const items = cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Create Razorpay order
      const orderResponse = await axios.post(`${apiUrl}/api/create-order`, {
        amount: totalAmount,
        currency: 'INR',
        items: items
      });

      const { orderId, keyId } = orderResponse.data;

      // Open Razorpay checkout
      const options = {
        key: keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'E-Commerce Demo',
        description: `Order for ${items.length} item(s)`,
        order_id: orderId,
        handler: async function (response) {
          // Payment successful
          try {
            // Verify payment with backend
            const verifyResponse = await axios.post(`${apiUrl}/api/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              setCart([]);
              const amount = (verifyResponse.data.payment.amount / 100).toFixed(2);
              alert(`✅ Payment successful! Thank you for your purchase.\nPayment ID: ${response.razorpay_payment_id}\nAmount: ₹${amount}`);
            } else {
              alert('❌ Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            alert('⚠️ Payment completed but verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        notes: {
          order_items: JSON.stringify(items)
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: function() {
            // User closed the checkout form
            setCheckoutLoading(false);
            console.log('Checkout form closed');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`❌ Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
        setCheckoutLoading(false);
      });

      razorpay.open();
      setCheckoutLoading(false);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to initialize payment. Please try again.');
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🛍️ E-Commerce Demo</h1>
        <p>Razorpay Payment Integration</p>
      </header>

      <div className="main-container">
        <ProductList products={products} onAddToCart={addToCart} />
        <Cart
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          totalPrice={getTotalPrice()}
          onCheckout={handleCheckout}
          checkoutLoading={checkoutLoading}
        />
      </div>
    </div>
  );
}

export default App;
