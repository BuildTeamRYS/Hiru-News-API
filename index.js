// Pure Cloudflare Worker entry point
// Routes to the existing api/ endpoints (Vercel-style functions converted to fetch responses)

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // CORS headers for all responses
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Simple routing mirror for existing api/ files
  const apiMap = {
    '/api/breaking-news': '/api/breaking-news.js',
    '/api/latest-news': '/api/latest-news.js',
    '/api/health': '/api/health.js',
    '/api/search': '/api/search.js',
    '/api/date': '/api/date.js',
    '/api/article': '/api/article',
  };

  // Try to match a known endpoint; otherwise return health/status
  if (pathname === '/' || pathname === '') {
    return new Response(JSON.stringify({
      service: 'hiru-news-api',
      status: 'ok',
      platform: 'cloudflare-workers',
      time: new Date().toISOString(),
      endpoints: Object.keys(apiMap)
    }), { status: 200, headers });
  }

  // Try dynamic match for /api/article/* or /api/category/* etc.
  if (pathname.startsWith('/api/')) {
    // For now return a proxy-style response indicating the endpoint exists
    // Full conversion of each api/*.js to Workers format requires rewriting (req,res) -> (request) handlers
    return new Response(JSON.stringify({
      endpoint: pathname,
      method: request.method,
      status: 'proxied',
      note: 'Full Vercel-style api/ handlers need conversion to Workers fetch format for full functionality.',
      time: new Date().toISOString()
    }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ error: 'Not found', path: pathname }), {
    status: 404,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}
