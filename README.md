# Razorpay E-Commerce Integration Demo

A complete end-to-end integration of Razorpay payment gateway with e-commerce website using React.js and Node.js.

## Quick Start

### 1. Get Razorpay Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com) (Test Mode)
2. Settings → API Keys
3. Copy **Key ID** (starts with `rzp_test_`) and **Key Secret**

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Run

```bash
# From project root
npm run install-all  # Install all dependencies
npm start            # Start both servers
```

Or manually:
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start
```

## Testing Payments

Use test card: `4111 1111 1111 1111`
- Any future expiry date
- Any CVV
- Any name

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment signature
- `GET /api/health` - Health check

## Project Structure

```
├── backend/          # Express server with Razorpay
├── frontend/         # React app
├── scripts/          # Start/stop scripts
└── README.md
```

## Notes

- Use **Test Mode** for development
- Never commit `.env` files
- All products are priced at ₹1 for testing
