const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const platform = os.platform();
const isWindows = platform === 'win32';

console.log('🛑 Stopping Stripe E-commerce Demo servers...\n');

// Function to kill process by PID
function killProcess(pid) {
  return new Promise((resolve) => {
    if (isWindows) {
      exec(`taskkill /PID ${pid} /F /T`, (error) => {
        if (error) {
          // Process might not exist, which is fine
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } else {
      exec(`kill ${pid}`, (error) => {
        if (error) {
          // Process might not exist, which is fine
          resolve(false);
        } else {
          resolve(true);
        }
      });
    }
  });
}

// Function to kill processes by name/port
function killByPort(port) {
  return new Promise((resolve) => {
    if (isWindows) {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.trim().split('\n');
          const pids = new Set();
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
              pids.add(pid);
            }
          });
          Promise.all(Array.from(pids).map(pid => killProcess(pid)))
            .then(() => resolve(true))
            .catch(() => resolve(false));
        } else {
          resolve(false);
        }
      });
    } else {
      exec(`lsof -ti:${port}`, (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n').filter(pid => pid);
          Promise.all(pids.map(pid => killProcess(pid)))
            .then(() => resolve(true))
            .catch(() => resolve(false));
        } else {
          resolve(false);
        }
      });
    }
  });
}

// Try to read PIDs from file
const pidFile = path.join(__dirname, '..', 'logs', 'pids.json');
let pids = null;

if (fs.existsSync(pidFile)) {
  try {
    pids = JSON.parse(fs.readFileSync(pidFile, 'utf8'));
  } catch (error) {
    console.log('⚠️  Could not read PID file, trying to kill by port...');
  }
}

async function stopServers() {
  let stopped = false;

  // Try to kill by stored PIDs first
  if (pids) {
    console.log('📝 Attempting to stop by stored PIDs...');
    if (pids.backend) {
      const backendStopped = await killProcess(pids.backend);
      if (backendStopped) {
        console.log('✅ Backend server stopped');
        stopped = true;
      }
    }
    if (pids.frontend) {
      const frontendStopped = await killProcess(pids.frontend);
      if (frontendStopped) {
        console.log('✅ Frontend server stopped');
        stopped = true;
      }
    }
  }

  // Also try to kill by port (in case PIDs didn't work)
  console.log('📝 Attempting to stop by port...');
  const backendPortStopped = await killByPort(5000);
  const frontendPortStopped = await killByPort(3000);

  if (backendPortStopped) {
    console.log('✅ Backend server (port 5000) stopped');
    stopped = true;
  }
  if (frontendPortStopped) {
    console.log('✅ Frontend server (port 3000) stopped');
    stopped = true;
  }

  // Clean up PID file
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }

  if (stopped) {
    console.log('\n✅ All servers stopped successfully!');
  } else {
    console.log('\n⚠️  No running servers found (or they were already stopped)');
  }
}

stopServers().catch(console.error);

