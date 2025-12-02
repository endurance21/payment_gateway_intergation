# Razorpay Setup Guide

## Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up for a free account (or log in if you have one)
3. Complete the account setup

## Step 2: Get API Keys

1. Make sure you're in **Test Mode** (toggle in the top right corner)
2. Go to **Settings** → **API Keys**
3. Click **Generate Key** if you don't have keys yet
4. Copy your **Key ID** (starts with `rzp_test_`)
5. Copy your **Key Secret** (click "Reveal" to see it)

## Step 3: Configure Backend

Edit `backend/.env`:

```
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

## Step 4: Configure Frontend

Edit `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

## Step 5: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 6: Start the Application

```bash
# From project root
npm start
```

Or start separately:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## Testing Payments

Use these test card numbers in Razorpay checkout:

- **Success**: `4111 1111 1111 1111`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `5267 3181 8797 5449`

Use:
- Any future expiry date (e.g., `12/34`)
- Any 3-digit CVV
- Any name

## Important Notes

- Always use **Test Mode** for development
- Never commit your `.env` files
- Keep your Key Secret secure
- For production, switch to Live Mode keys
