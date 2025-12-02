const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
});

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Sample products data
const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with noise cancellation',
    price: 1.00,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
  },
  {
    id: 2,
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking',
    price: 1.00,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
  },
  {
    id: 3,
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand',
    price: 1.00,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 1.00,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'
  }
];

// Routes

// Get all products
app.get('/api/products', (req, res) => {
  try {
    console.log('[GET /api/products] Fetching all products');
    console.log(`[GET /api/products] Returning ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('[GET /api/products] Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log(`[GET /api/products/:id] Fetching product with ID: ${productId}`);
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      console.log(`[GET /api/products/:id] Product not found: ${productId}`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log(`[GET /api/products/:id] Product found: ${product.name}`);
    res.json(product);
  } catch (error) {
    console.error('[GET /api/products/:id] Error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  const startTime = Date.now();
  try {
    const { amount, currency = 'INR', items = [] } = req.body;
    
    console.log('[POST /api/create-order] Creating new order', {
      amount,
      currency,
      itemCount: items.length
    });

    if (!amount || amount <= 0) {
      console.log('[POST /api/create-order] Invalid amount received:', amount);
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Convert amount to paise (smallest currency unit for INR)
    const amountInPaise = Math.round(amount * 100);
    const receipt = `receipt_${Date.now()}`;

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt,
      notes: {
        order_items: JSON.stringify(items)
      }
    };

    console.log('[POST /api/create-order] Creating Razorpay order with options:', {
      amount: amountInPaise,
      currency,
      receipt
    });

    const order = await razorpayInstance.orders.create(options);

    const responseTime = Date.now() - startTime;
    console.log('[POST /api/create-order] Order created successfully', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      responseTime: `${responseTime}ms`
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('[POST /api/create-order] Error creating Razorpay order:', {
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Verify payment signature
app.post('/api/verify-payment', async (req, res) => {
  const startTime = Date.now();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log('[POST /api/verify-payment] Verifying payment', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log('[POST /api/verify-payment] Missing payment details', {
        hasOrderId: !!razorpay_order_id,
        hasPaymentId: !!razorpay_payment_id,
        hasSignature: !!razorpay_signature
      });
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Create signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    console.log('[POST /api/verify-payment] Signature verification', {
      generated: generated_signature.substring(0, 10) + '...',
      received: razorpay_signature.substring(0, 10) + '...',
      match: generated_signature === razorpay_signature
    });

    // Verify signature
    if (generated_signature === razorpay_signature) {
      console.log('[POST /api/verify-payment] Signature verified, fetching payment details');
      
      // Fetch payment details from Razorpay
      try {
        const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
        
        const responseTime = Date.now() - startTime;
        console.log('[POST /api/verify-payment] Payment verified successfully', {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          responseTime: `${responseTime}ms`
        });
        
        res.json({
          success: true,
          payment: {
            id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            created_at: payment.created_at
          }
        });
      } catch (error) {
        console.error('[POST /api/verify-payment] Error fetching payment details:', {
          error: error.message,
          paymentId: razorpay_payment_id
        });
        res.json({
          success: true,
          message: 'Payment verified but could not fetch details'
        });
      }
    } else {
      console.log('[POST /api/verify-payment] Invalid payment signature');
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('[POST /api/verify-payment] Error verifying payment:', {
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });
    res.status(500).json({ error: error.message || 'Failed to verify payment' });
  }
});

// Webhook endpoint for Razorpay events (for production)
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const startTime = Date.now();
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    console.log('[POST /api/webhook] Webhook received', {
      hasSignature: !!webhookSignature,
      hasSecret: !!webhookSecret
    });

    if (!webhookSecret) {
      console.log('[POST /api/webhook] Webhook secret not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    const text = req.body.toString();
    const generated_signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(text)
      .digest('hex');

    console.log('[POST /api/webhook] Signature verification', {
      generated: generated_signature.substring(0, 10) + '...',
      received: webhookSignature?.substring(0, 10) + '...',
      match: generated_signature === webhookSignature
    });

    if (generated_signature !== webhookSignature) {
      console.error('[POST /api/webhook] Webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(text);
    console.log('[POST /api/webhook] Webhook event received', {
      eventType: event.event,
      eventId: event.id
    });

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        console.log('[POST /api/webhook] Payment captured', {
          paymentId: event.payload.payment.entity.id,
          orderId: event.payload.payment.entity.order_id,
          amount: event.payload.payment.entity.amount
        });
        // Update order status in your database here
        break;
      case 'payment.failed':
        console.log('[POST /api/webhook] Payment failed', {
          paymentId: event.payload.payment.entity.id,
          orderId: event.payload.payment.entity.order_id,
          error: event.payload.payment.entity.error_description
        });
        // Handle failed payment
        break;
      case 'order.paid':
        console.log('[POST /api/webhook] Order paid', {
          orderId: event.payload.order.entity.id,
          amount: event.payload.order.entity.amount
        });
        break;
      default:
        console.log(`[POST /api/webhook] Unhandled event type: ${event.event}`);
    }

    const responseTime = Date.now() - startTime;
    console.log('[POST /api/webhook] Webhook processed successfully', {
      eventType: event.event,
      responseTime: `${responseTime}ms`
    });

    res.json({ received: true });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('[POST /api/webhook] Error processing webhook:', {
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  try {
    console.log('[GET /api/health] Health check requested');
    const healthStatus = {
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
    console.log('[GET /api/health] Health check response:', healthStatus);
    res.json(healthStatus);
  } catch (error) {
    console.error('[GET /api/health] Error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Health check failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Make sure to set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file`);
});
