import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import './Checkout.css';

const CheckoutForm = ({ cart, totalPrice, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
      return;
    }

    // Get the client secret from the payment intent
    const { error: paymentError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (paymentError) {
      setError(paymentError.message);
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2>Checkout</h2>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="summary-item">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <PaymentElement />
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="checkout-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pay-btn"
              disabled={!stripe || processing}
            >
              {processing ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Checkout = ({ cart, totalPrice, onSuccess, onCancel }) => {
  return <CheckoutForm cart={cart} totalPrice={totalPrice} onSuccess={onSuccess} onCancel={onCancel} />;
};

export default Checkout;

