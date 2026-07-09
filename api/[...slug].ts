import { app } from '../src/app';

// Vercel Edge/Node Web Standard Request Handler
export default function handler(request: Request) {
  return app.handle(request);
}
