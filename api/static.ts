import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  try {
    // Basic parse of URL to remove query params
    const rawUrl = (req.url || "/").split("?")[0];
    const urlPath = rawUrl === '/' || rawUrl === '' ? '/index.html' : rawUrl;
    
    // Resolve the file path inside 'public' folder
    const filePath = path.join(process.cwd(), 'public', urlPath);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      if (ext === '.html') contentType = 'text/html';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      
      const content = fs.readFileSync(filePath);
      res.setHeader('Content-Type', contentType);
      res.status(200).send(content);
    } else {
      // SPA Fallback: serve index.html for any unknown route
      const fallbackPath = path.join(process.cwd(), 'public', 'index.html');
      if (fs.existsSync(fallbackPath)) {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(fs.readFileSync(fallbackPath));
      } else {
        res.status(404).send("404 - File not found in public directory. urlPath=" + urlPath + ", cwd=" + process.cwd());
      }
    }
  } catch (err: any) {
    res.status(200).send("STATIC HANDLER ERROR: " + err.message + "\n" + err.stack);
  }
}
