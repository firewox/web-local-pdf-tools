const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const { spawn } = require('child_process');

const BASE_PATH = '/web-local-pdf-tools';

// Resolve project root and dist directory for both dev and packaged exe
const isPackaged = !!process.pkg;
const projectRoot = isPackaged ? path.dirname(process.execPath) : __dirname;
const distDir = path.join(projectRoot, 'dist');
const logsDir = path.join(projectRoot, 'logs');

const app = express();

// Ensure logs directory exists
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (e) {
  console.error('Failed to create logs directory:', e);
}

// Access and error log streams
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });

// Request logging (to console and file)
app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));

// Redirect root to base path
app.get('/', (req, res) => {
  res.redirect(`${BASE_PATH}/`);
});

// Serve static files under the base path
app.use(BASE_PATH, express.static(distDir, { index: 'index.html' }));

// Fallback to index.html for SPA-like deep links under base path
app.get(`${BASE_PATH}/*`, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// Simple endpoints to view logs if needed
app.get(`${BASE_PATH}/logs/access`, (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  fs.createReadStream(path.join(logsDir, 'access.log')).pipe(res);
});
app.get(`${BASE_PATH}/logs/error`, (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  fs.createReadStream(path.join(logsDir, 'error.log')).pipe(res);
});

let port = 5000;

function openBrowser(url) {
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', url], { detached: true, windowsHide: true });
    } else if (process.platform === 'darwin') {
      spawn('open', [url], { detached: true });
    } else {
      spawn('xdg-open', [url], { detached: true });
    }
  } catch (e) {
    console.error('Failed to open browser automatically:', e);
  }
}

function startServer() {
  const server = app.listen(port, '0.0.0.0', () => {
    const url = `http://localhost:${port}${BASE_PATH}/`;
    console.log(`Server running at ${url}`);
    try {
      accessLogStream.write(`[${new Date().toISOString()}] SERVER START ${url}\n`);
    } catch {}
    openBrowser(url);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      port += 1;
      startServer();
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  try {
    const entry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ERROR: ${err && err.stack ? err.stack : err}\n`;
    errorLogStream.write(entry);
  } catch {}
  console.error('Express error:', err);
  res.status(500).send('Internal Server Error');
});

// Process-level error logging
process.on('uncaughtException', (err) => {
  try {
    errorLogStream.write(`[${new Date().toISOString()}] UNCAUGHT_EXCEPTION: ${err && err.stack ? err.stack : err}\n`);
  } catch {}
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  try {
    errorLogStream.write(`[${new Date().toISOString()}] UNHANDLED_REJECTION: ${reason && reason.stack ? reason.stack : reason}\n`);
  } catch {}
  console.error('Unhandled Rejection:', reason);
});

startServer();