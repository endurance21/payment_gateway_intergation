# Quick Setup Guide

## Step 1: Get Stripe API Keys

1. Sign up or log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Go to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)

## Step 2: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
# Copy the example file
cp .env.example .env

# Or create manually with:
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
PORT=5000
```

Replace `sk_test_your_secret_key_here` with your actual secret key.

## Step 3: Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```bash
# Copy the example file
cp .env.example .env

# Or create manually with:
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
REACT_APP_API_URL=http://localhost:5000
```

Replace `pk_test_your_publishable_key_here` with your actual publishable key.

## Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## Testing Payments

Use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., `12/34`)
- Any 3-digit CVC
- Any ZIP code

## Troubleshooting

**"Invalid API Key" error:**
- Make sure you copied the keys correctly
- Ensure you're using test mode keys (start with `pk_test_` and `sk_test_`)
- Check that both keys are from the same Stripe account

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`

**CORS errors:**
- Make sure backend is running before starting frontend
- Check that backend has CORS enabled (it should be configured)

