export default function handler(request: Request) {
  return new Response("Hello from test endpoint", {
    status: 200
  });
}
