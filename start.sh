#!/bin/bash

# Start script for Stripe E-commerce Demo
# This script starts both backend and frontend servers

echo "🚀 Starting Stripe E-commerce Demo..."
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "📝 Please create backend/.env with your Stripe keys (see SETUP.md)"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "❌ Error: frontend/.env file not found!"
    echo "📝 Please create frontend/.env with your Stripe keys (see SETUP.md)"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Start backend
echo "📦 Starting backend server..."
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "⚛️  Starting frontend server..."
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Save PIDs
echo "{\"backend\": $BACKEND_PID, \"frontend\": $FRONTEND_PID}" > logs/pids.json

echo ""
echo "✅ Servers starting..."
echo "📝 Logs are being written to logs/ directory"
echo "🌐 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "💡 To stop servers, run: npm run stop"
echo "💡 Or press Ctrl+C and run: ./stop.sh"
echo "is it running? yes."

# Wait for user interrupt

wait

