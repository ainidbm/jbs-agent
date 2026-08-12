/**
 * Runtime API configuration.
 *
 * Production builds must define VITE_WORKER_URL. Failing fast here is
 * deliberate: a silent empty base caused all API calls to hit GitHub Pages
 * and return 404.
 */

const RAW = import.meta.env.VITE_WORKER_URL as string | undefined;

if (import.meta.env.PROD && !RAW) {
  throw new Error(
    "VITE_WORKER_URL is required in production builds. Set it in .env.production or the CI environment."
  );
}

export const API_BASE = (RAW || "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function redirectToLogin() {
  localStorage.removeItem("jbs_token");
  localStorage.removeItem("jbs_store");
  window.location.hash = "#/login";
}
