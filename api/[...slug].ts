import fs from "fs";
import path from "path";

export default async function handler(req: any, res: any) {
  try {
    const rawUrl = (req.url || "/").split("?")[0];
    
    // 1. If it's an API route, pass to Elysia
    if (rawUrl.startsWith("/api") && !rawUrl.startsWith("/api/docs") && !rawUrl.startsWith("/api/assets")) {
      const { app } = await import('../src/app.js');
      
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
      const webRes = await app.handle(webReq);
      
      res.status(webRes.status);
      webRes.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      
      const body = await webRes.text();
      res.send(body);
      return;
    }
    
    // 2. Otherwise, serve static files (SPA)
    let urlPath = rawUrl;
    if (urlPath === '/api/docs' || urlPath === '/' || urlPath === '') urlPath = '/index.html';
    if (urlPath.startsWith('/api/assets/')) urlPath = urlPath.replace('/api/assets/', '/assets/');
    
    const filePath = path.join(process.cwd(), 'public', urlPath);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      if (ext === '.html') contentType = 'text/html';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.json') contentType = 'application/json';
      
      res.setHeader('Content-Type', contentType);
      res.status(200).send(fs.readFileSync(filePath));
    } else {
      // SPA Fallback
      const fallbackPath = path.join(process.cwd(), 'public', 'index.html');
      if (fs.existsSync(fallbackPath)) {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(fs.readFileSync(fallbackPath));
      } else {
        res.status(404).send("404 - File not found. urlPath=" + urlPath + " cwd=" + process.cwd());
      }
    }
  } catch (err: any) {
    res.status(200).send("CATCHALL ERROR: " + err.message + "\\n" + err.stack);
  }
}
