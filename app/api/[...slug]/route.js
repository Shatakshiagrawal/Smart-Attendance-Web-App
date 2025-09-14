import { NextResponse } from 'next/server';
import app from '@/lib/server/server.js'; // Import our Express app

// This function creates a request listener that we can use to handle requests
const listener = app.listen(0, 'localhost');

// This is the main handler for all API requests
const handler = (req) => {
  return new Promise(async (resolve) => {
    const url = new URL(req.url);
    
    // Rewrite the URL to point to our in-memory Express server
    const proxyUrl = `http://localhost:${listener.address().port}${url.pathname}${url.search}`;

    // Forward the request
    const res = await fetch(proxyUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
      redirect: 'manual',
      duplex: 'half' // Required for streaming request bodies
    });

    resolve(res);
  });
};

// Export the handler for all HTTP methods
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };