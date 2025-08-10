export const apiBase =
  process.env.NEXT_PUBLIC_BACKEND_HTTP_URL ||
  "https://power-dashboard-backend.onrender.com";

export function wsUrl() {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL;
  if (envUrl) {
    if (envUrl.toLowerCase() === "disabled") return null;
    return envUrl;
  }

  // Derive WS URL from apiBase when possible
  try {
    const u = new URL(apiBase);
    const scheme = u.protocol === "https:" ? "wss" : "ws";
    return `${scheme}://${u.host}`;
  } catch {
    // ignore
  }

  // Fallback to page protocol + host if running in browser
  if (typeof window !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const host = window.location.host; // includes port if any
    return `${isHttps ? "wss" : "ws"}://${host}`;
  }

  // Final fallback: hosted backend
  return "wss://power-dashboard-backend.onrender.com";
}

export function withParams(url, params) {
  const u = new URL(url);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
  });
  return u.toString();
}
