import { app } from '../src/app';

export default function handler(request: Request) {
  return app.handle(request);
}
