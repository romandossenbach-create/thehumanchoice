const ALLOWED_APP_ORIGINS = new Set([
  "https://road-to-100-pushups.roman-dossenbach.chatgpt.site",
  "https://your-choice-pushup-challenge.roman-dossenbach.chatgpt.site",
  "https://pushup-world-ranking.roman-dossenbach.chatgpt.site",
]);

function corsHeaders(request?: Request) {
  const origin = request?.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
  if (ALLOWED_APP_ORIGINS.has(origin)) headers["access-control-allow-origin"] = origin;
  return headers;
}

export function roadCorsJson(request: Request, body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  Object.entries(corsHeaders(request)).forEach(([key, value]) => headers.set(key, value));
  return Response.json(body, { ...init, headers });
}

export function roadCorsOptions(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
