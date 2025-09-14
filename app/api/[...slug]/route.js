import { NextResponse } from 'next/server';
import app from '@/lib/server/server.js';

const listener = app.listen(0, 'localhost');
const ready = new Promise((resolve) => listener.on('listening', resolve));

const handler = async (req) => {
  await ready;
  const port = listener.address().port;
  const url = new URL(req.url);

  // Forward the original path WITHOUT changing it
  const proxyUrl = `http://localhost:${port}${url.pathname}${url.search}`;

  return fetch(proxyUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
    redirect: 'manual',
    duplex: 'half'
  });
};

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };