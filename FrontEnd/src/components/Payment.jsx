import React, { useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.id = 'razorpay-sdk';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment({ amount,propertyId,sellerId, onClose }) {
    const buyerId = useSelector((state) => state.auth.userData?._id);
  useEffect(() => {
    (async () => {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert('Failed to load Razorpay SDK');
        onClose();
        return;
      }

      try {
        // 1. Create order & transaction on backend
        const { data } = await axios.post(
          'http://localhost:3000/transactions/order',
          { price: amount, propertyId: propertyId, buyerId: buyerId, sellerId: sellerId, paymentMethod: 'UPI' },
          {
            withCredentials: true,
          }
        );
        const { transaction, order } = data.data;

        // 2. Razorpay checkout options
        const options = {
          key: 'rzp_test_Yf39QmdXw0QA0W',
          amount: order.amount,
          currency: order.currency,
          name: 'My Real Estate Site',
          description: 'Property booking payment',
          order_id: order.id,
          handler: async (response) => {
            try {
              // 3. Verify payment on backend
              await axios.post(
                'http://localhost:3000/transactions/verify',
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  transactionId: transaction._id
                }
              );
              alert('Payment successful and verified!');
            } catch (err) {
              console.error(err);
              alert('Payment verification failed.');
            } finally {
              onClose();
            }
          },
          prefill: {
            name: '',   // optionally fill user’s name
            email: ''   // and email
          },
          theme: { color: '#528FF0' }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } catch (err) {
        console.error(err);
        alert('Could not create order. Please try again.');
        onClose();
      }
    })();
  }, [amount, onClose]);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <p>Loading payment interface…</p>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
