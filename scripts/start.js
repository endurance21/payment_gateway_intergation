const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const backendLog = path.join(logsDir, 'backend.log');
const frontendLog = path.join(logsDir, 'frontend.log');

console.log('🚀 Starting Stripe E-commerce Demo...\n');

// Check if .env files exist
const backendEnv = path.join(__dirname, '..', 'backend', '.env');
const frontendEnv = path.join(__dirname, '..', 'frontend', '.env');

if (!fs.existsSync(backendEnv)) {
  console.error('❌ Error: backend/.env file not found!');
  console.log('📝 Please create backend/.env with your Stripe keys (see SETUP.md)');
  process.exit(1);
}

if (!fs.existsSync(frontendEnv)) {
  console.error('❌ Error: frontend/.env file not found!');
  console.log('📝 Please create frontend/.env with your Stripe keys (see SETUP.md)');
  process.exit(1);
}

// Start backend
console.log('📦 Starting backend server...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
  fs.appendFileSync(backendLog, data);
});

backend.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
  fs.appendFileSync(backendLog, data);
});

// Start frontend
console.log('⚛️  Starting frontend server...\n');
const frontend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, '..', 'frontend'),
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
  env: { ...process.env, BROWSER: 'none' } // Prevent auto-opening browser
});

frontend.stdout.on('data', (data) => {
  const output = data.toString();
  // Only show important frontend messages
  if (output.includes('Compiled') || output.includes('webpack') || output.includes('Local:')) {
    console.log(`[Frontend] ${output.trim()}`);
  }
  fs.appendFileSync(frontendLog, data);
});

frontend.stderr.on('data', (data) => {
  console.error(`[Frontend Error] ${data.toString().trim()}`);
  fs.appendFileSync(frontendLog, data);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});

// Store PIDs for stop script
const pids = {
  backend: backend.pid,
  frontend: frontend.pid
};

const pidFile = path.join(__dirname, '..', 'logs', 'pids.json');
fs.writeFileSync(pidFile, JSON.stringify(pids, null, 2));

console.log('✅ Servers starting...');
console.log('📝 Logs are being written to logs/ directory');
console.log('🌐 Backend: http://localhost:5000');
console.log('🌐 Frontend: http://localhost:3000 (will open automatically)');
console.log('\n💡 Press Ctrl+C to stop both servers\n');

