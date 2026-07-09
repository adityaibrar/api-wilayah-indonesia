export default async function handler(req: any, res: any) {
  try {
    const { app } = await import('../src/app');
    
    // Convert Node IncomingMessage to Web Request
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url, `${protocol}://${host}`);
    
    const init: RequestInit = {
      method: req.method,
      headers: req.headers as any,
    };
    
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
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
  } catch (err: any) {
    res.status(200).send("FATAL ERROR CAUGHT: " + err.message + "\\n" + err.stack);
  }
}
