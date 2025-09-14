import { NextResponse } from 'next/server';
import app from '@/lib/server/server.js'; // Import our Express app

// Initialize the server once and reuse it across requests
const listener = app.listen(0, 'localhost');

// Create a promise that resolves when the server is ready
const ready = new Promise((resolve) => listener.on('listening', resolve));

// This is the main handler for all API requests
const handler = async (req) => {
  // Wait for the server to be ready
  await ready;
  const port = listener.address().port;

  const url = new URL(req.url);
  
  // CRITICAL FIX: Remove the '/api' prefix from the path before forwarding
  const pathname = url.pathname.replace(/^\/api/, '');

  // Rewrite the URL to point to our in-memory Express server
  const proxyUrl = `http://localhost:${port}${pathname}${url.search}`;

  // Forward the request and return the response
  return fetch(proxyUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
    redirect: 'manual',
    duplex: 'half' // Required for streaming request bodies
  });
};

// Export the handler for all HTTP methods
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };