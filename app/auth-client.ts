import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config";

export const ACCESS_KEY = "pushup-supabase-access-token";
export const REFRESH_KEY = "pushup-supabase-refresh-token";
export const REMEMBER_KEY = "pushup-remember-session";
const CACHED_USER_KEY = "pushup-cached-session-user";

type TokenResponse = { access_token?: string; refresh_token?: string };
let refreshPromise: Promise<string | null> | null = null;
let sessionInitPromise: Promise<Awaited<ReturnType<typeof loadSession>>> | null = null;

function getStored(key: string) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

export function saveSession(data: TokenResponse) {
  localStorage.setItem(REMEMBER_KEY, "true");
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  if (data.access_token) localStorage.setItem(ACCESS_KEY, data.access_token);
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem(CACHED_USER_KEY);
}

function accessTokenExpiresSoon(token: string | null, marginSeconds = 90) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?:number };
    return Number(payload.exp || 0) * 1000 <= Date.now() + marginSeconds * 1000;
  } catch { return true; }
}

function captureSessionFromConfirmationLink() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(location.search);
  const access_token = hash.get("access_token") || query.get("access_token") || undefined;
  const refresh_token = hash.get("refresh_token") || query.get("refresh_token") || undefined;
  if (!access_token) return false;
  saveSession({ access_token, refresh_token });
  history.replaceState({}, document.title, location.pathname);
  return true;
}

async function performRefresh() {
  const refreshToken = getStored(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) {
      // A second tab may already have rotated the refresh token. Never erase a
      // newer session that was saved while this request was in flight.
      if ((response.status === 400 || response.status === 401) && getStored(REFRESH_KEY) === refreshToken) clearSession();
      return null;
    }
    const data = await response.json() as TokenResponse;
    saveSession(data);
    return data.access_token || null;
  } catch {
    return null;
  }
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function loadSession() {
  const temporaryAccess = sessionStorage.getItem(ACCESS_KEY);
  const temporaryRefresh = sessionStorage.getItem(REFRESH_KEY);
  if (temporaryAccess || temporaryRefresh) saveSession({ access_token:temporaryAccess || undefined, refresh_token:temporaryRefresh || undefined });
  captureSessionFromConfirmationLink();
  let token = getStored(ACCESS_KEY);
  if (!token || accessTokenExpiresSoon(token)) token = await refreshSession();
  if (!token) return null;
  let response = await fetch("/api/session", { cache: "no-store", headers: { authorization: `Bearer ${token}` } });
  if (response.status === 401) {
    token = await refreshSession();
    if (!token) return null;
    response = await fetch("/api/session", { cache: "no-store", headers: { authorization: `Bearer ${token}` } });
  }
  // Temporary connection/server failures must not turn a saved login into an
  // apparent logout. The stored refresh session remains available for retry.
  if (!response.ok) {
    try { return JSON.parse(localStorage.getItem(CACHED_USER_KEY) || "null"); } catch { return null; }
  }
  const data = await response.json() as { user?: { displayName: string; email: string; gender?:"male"|"female"|null; isAdmin?:boolean; admin2faVerified?:boolean } | null };
  if (!data.user) clearSession();
  else localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
  return data.user || null;
}

export function initializeSession() {
  // Dashboard and login can both mount while a saved token is being refreshed.
  // Share the in-flight check so neither page redirects on an intermediate result.
  if (!sessionInitPromise) sessionInitPromise = loadSession().finally(() => { sessionInitPromise = null; });
  return sessionInitPromise;
}

export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  let token = getStored(ACCESS_KEY);
  if (!token || accessTokenExpiresSoon(token)) token = await refreshSession();
  const send = (accessToken: string | null) => fetch(input, {
    ...init,
    headers: { ...Object.fromEntries(new Headers(init.headers).entries()), ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
  });
  let response = await send(token);
  if (response.status === 401 && getStored(REFRESH_KEY)) {
    token = await refreshSession();
    if (token) response = await send(token);
  }
  return response;
}

let maintenanceStarted = false;
export function startSessionMaintenance() {
  if (maintenanceStarted || typeof window === "undefined") return;
  maintenanceStarted = true;
  const renew = () => { if (getStored(REFRESH_KEY) && accessTokenExpiresSoon(getStored(ACCESS_KEY), 300)) void refreshSession(); };
  window.addEventListener("online", renew);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") renew(); });
  window.setInterval(renew, 4 * 60 * 1000);
}
