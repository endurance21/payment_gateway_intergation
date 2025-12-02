# Troubleshooting Stripe Integration

## "Origins don't match" Error

This error occurs when Stripe cannot verify the origin of your application. Here's how to fix it:

### Solution 1: Check Stripe Dashboard Domain Restrictions (MOST COMMON)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Click on your **Publishable key** (starts with `pk_test_`)
3. Scroll down to **"Domain restrictions"** section
4. **Either:**
   - **Disable domain restrictions** (recommended for development)
   - **OR** add `localhost:3000` to the allowed domains list

### Solution 2: Verify Your Environment Variables

Make sure your `.env` files are set up correctly:

**Backend (`backend/.env`):**
```
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

**Frontend (`frontend/.env`):**
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
REACT_APP_API_URL=http://localhost:5000
```

**Important:** 
- Both keys must be from the **same Stripe account**
- Both keys must be in **test mode** (start with `pk_test_` and `sk_test_`)
- After changing `.env` files, **restart both servers**

### Solution 3: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use incognito/private browsing mode

### Solution 4: Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- Any red error messages
- Warnings about Stripe
- CORS errors
- Network errors

### Solution 5: Verify Servers Are Running

Make sure both servers are running:
- Backend: `http://localhost:5000` (check in browser or terminal)
- Frontend: `http://localhost:3000` (should open automatically)

### Solution 6: Test with Stripe Test Cards

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date (e.g., `12/34`)
- Use any 3-digit CVC
- Use any ZIP code

## Other Common Issues

### "Payment Element requires clientSecret"

- Make sure the payment intent is created successfully
- Check backend logs for errors
- Verify `STRIPE_SECRET_KEY` is set correctly in backend `.env`

### CORS Errors

- Backend CORS is configured to allow `localhost:3000`
- If you're using a different port, update `backend/server.js` CORS configuration

### Payment Intent Creation Fails

- Check backend terminal for error messages
- Verify `STRIPE_SECRET_KEY` is correct
- Make sure you're using test mode keys
- Check that the total amount is greater than 0

## Still Having Issues?

1. Check the browser console (F12) for detailed error messages
2. Check backend terminal for server errors
3. Verify all environment variables are set correctly
4. Make sure you're using test mode keys (not live mode)
5. Try creating a new set of API keys in Stripe Dashboard

