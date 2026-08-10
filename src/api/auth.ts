/**
 * Auth helpers — JWT storage + login/logout.
 */

const TOKEN_KEY = "jbs_token";
const STORE_KEY = "jbs_store";

export interface StoreInfo {
  id: string;
  name: string;
  city: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStore(): StoreInfo | null {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveAuth(token: string, store: StoreInfo) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STORE_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export async function login(password: string, storeId: string): Promise<{ token: string; store: StoreInfo }> {
  const BASE = import.meta.env.VITE_WORKER_URL || "";
  const resp = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, storeId }),
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error || "Login failed");
  }
  return resp.json();
}

export async function fetchStores(): Promise<StoreInfo[]> {
  const BASE = import.meta.env.VITE_WORKER_URL || "";
  const resp = await fetch(`${BASE}/api/stores/public`);
  return resp.json();
}
