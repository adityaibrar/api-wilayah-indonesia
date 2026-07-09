import { app } from '../src/app';

export default async function handler(req: any, res: any) {
  // Convert Node IncomingMessage to Web Request
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = new URL(req.url, `${protocol}://${host}`);
  
  const init: RequestInit = {
    method: req.method,
    headers: req.headers as any,
  };
  
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    // Basic body support (usually Vercel parses this into an object for JSON)
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }
  
  const webReq = new Request(url.toString(), init);
  
  // Call Elysia
  const webRes = await app.handle(webReq);
  
  // Convert Web Response back to Vercel Node Response
  res.status(webRes.status);
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  
  const body = await webRes.text();
  res.send(body);
}
