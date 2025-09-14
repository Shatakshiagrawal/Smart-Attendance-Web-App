import { NextResponse } from 'next/server';
import app from '../../../backend/server.js'; // Adjust the path to your Express app

const handler = (req) => {
  return new Promise((resolve) => {
    const listener = app.listen(0, 'localhost', () => {
      const port = listener.address().port;
      const url = new URL(req.url);
      const proxyUrl = `http://localhost:${port}${url.pathname}${url.search}`;

      fetch(proxyUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
        redirect: 'manual',
      }).then((res) => {
        listener.close();
        resolve(res);
      }).catch((err) => {
        listener.close();
        console.error("Fetch error in proxy:", err);
        resolve(NextResponse.json({ message: "Internal Server Error" }, { status: 500 }));
      });
    });
  });
};

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };