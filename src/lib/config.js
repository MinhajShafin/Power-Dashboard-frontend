export const apiBase =
  process.env.NEXT_PUBLIC_BACKEND_HTTP_URL || "http://localhost:9060";

export function wsUrl() {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL;
  if (envUrl) return envUrl;

  if (typeof window !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const host =
      process.env.NEXT_PUBLIC_BACKEND_HOST ||
      window.location.hostname ||
      "localhost";
    const port = process.env.NEXT_PUBLIC_BACKEND_PORT || "9060";
    return `${isHttps ? "wss" : "ws"}://${host}:${port}`;
  }
  return "ws://localhost:9060";
}

export function withParams(url, params) {
  const u = new URL(url);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
  });
  return u.toString();
}
