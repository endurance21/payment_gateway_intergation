# Razorpay E-Commerce Integration Demo

A complete end-to-end e-commerce demo application showcasing Razorpay payment integration with React.js frontend and Node.js backend.

## Features

- 🛍️ Product catalog with beautiful UI
- 🛒 Shopping cart functionality
- 💳 Secure payment processing with Razorpay
- 📱 Responsive design
- ⚡ Real-time payment verification
- 🎨 Modern, clean interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Razorpay account (test mode is fine for development)

## Razorpay Setup

You'll need to get your Razorpay API keys:

1. Sign up or log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Go to **Settings** → **API Keys**
4. Copy your **Key ID** (starts with `rzp_test_`)
5. Copy your **Key Secret**

**Note:** For testing, you can use Razorpay's test mode. Use test card numbers like:
- Success: `4111 1111 1111 1111`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date, any CVV, and any name

## Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Razorpay keys:

```
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add:

```
REACT_APP_API_URL=http://localhost:5000
```

## Running the Application

### Quick Start (Recommended)

Install all dependencies and start both servers with one command:

```bash
# Install all dependencies (root, backend, and frontend)
npm run install-all

# Start both servers
npm start
```

To stop both servers:
```bash
npm run stop
```

Or use the shell scripts:
```bash
./start.sh    # Start both servers
./stop.sh     # Stop both servers
```

### Manual Start (Alternative)

If you prefer to run servers separately:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The backend will run on `http://localhost:5000`  
The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Project Structure

```
razorpay_integration/
├── backend/
│   ├── server.js          # Express server with Razorpay integration
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductList.js
│   │   │   ├── Cart.js
│   │   │   └── Checkout.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env.example
├── scripts/
│   ├── start.js           # Start script (Node.js)
│   └── stop.js            # Stop script (Node.js)
├── start.sh               # Start script (Shell)
├── stop.sh                # Stop script (Shell)
├── package.json           # Root package.json with scripts
└── README.md
```

## How It Works

1. **Product Display**: The frontend fetches products from the backend API
2. **Cart Management**: Users can add/remove items and adjust quantities
3. **Order Creation**: When checking out, the backend creates a Razorpay order
4. **Payment Processing**: Razorpay checkout modal handles the secure payment form
5. **Payment Verification**: Backend verifies the payment signature for security
6. **Confirmation**: Payment is confirmed and the order is processed

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/create-order` - Create a Razorpay order
- `POST /api/verify-payment` - Verify payment signature
- `POST /api/webhook` - Razorpay webhook endpoint (for production)
- `GET /api/health` - Health check

## Testing Payments

Use Razorpay's test card numbers:

- **Success**: `4111 1111 1111 1111`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `5267 3181 8797 5449`

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVV
- Any name

## Security Notes

- Never commit your `.env` files to version control
- Always use environment variables for API keys
- Payment signatures are verified on the backend
- In production, use HTTPS
- Set up webhook signature verification for production
- Use Razorpay's test mode for development

## Production Deployment

For production:

1. Switch to Razorpay live mode keys
2. Set up webhook endpoints in Razorpay Dashboard
3. Configure `RAZORPAY_WEBHOOK_SECRET` in backend `.env`
4. Use HTTPS for all connections
5. Set up proper error handling and logging
6. Add database for order management

## Troubleshooting

**Backend won't start:**
- Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `.env`
- Ensure port 5000 is not in use

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`

**Payment fails:**
- Verify both key ID and key secret are from the same Razorpay account
- Check browser console for errors
- Ensure you're using test mode keys with test cards
- Make sure Razorpay checkout script is loaded (check Network tab)

**"Razorpay is not defined" error:**
- Check that Razorpay script is loaded in `public/index.html`
- Clear browser cache and reload

## License

This is a demo project for educational purposes.
