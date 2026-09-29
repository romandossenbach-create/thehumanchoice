const STATE_KEY = "your-choice-challenge-v1";
const ACCESS_KEY = "pushup-supabase-access-token";
const REFRESH_KEY = "pushup-supabase-refresh-token";
const SUPABASE_URL = "https://tlcuogpjvckiyaommofm.supabase.co";
const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";

function readState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || "null"); } catch { return null; }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (data.access_token) localStorage.setItem(ACCESS_KEY, data.access_token);
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
  return data.access_token || null;
}

async function accountFetch(init = {}) {
  let accessToken = localStorage.getItem(ACCESS_KEY);
  if (!accessToken) accessToken = await refreshAccessToken();
  if (!accessToken) return null;
  const send = () => fetch("/api/challenge", {
    ...init,
    headers: { ...(init.headers || {}), authorization: `Bearer ${accessToken}` },
  });
  let response = await send();
  if (response.status === 401 && (accessToken = await refreshAccessToken())) response = await send();
  return response;
}

async function saveStateToAccount() {
  const state = readState();
  if (!state?.days || !state?.target || !state?.start) return;
  await accountFetch({
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      days: state.days,
      target: state.target,
      start: state.start,
      total: Math.max(0, Number(state.total) || 0),
      today: Math.max(0, Number(state.today) || 0),
      todayDate: state.todayDate || (()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`})(),
    }),
  });
}

async function loadStateFromAccount() {
  const response = await accountFetch({ cache: "no-store" });
  if (!response?.ok) return;
  const data = await response.json();
  if (data.challenge) {
    const local = readState();
    localStorage.setItem(STATE_KEY, JSON.stringify({
      ...data.challenge,
      pending: Math.max(0, Number(local?.pending) || 0),
    }));
  } else {
    await saveStateToAccount();
  }
}

await loadStateFromAccount();

const saveMessage = document.querySelector("#saveMessage");
if (saveMessage) new MutationObserver(() => { void saveStateToAccount(); })
  .observe(saveMessage, { childList: true, characterData: true, subtree: true });

document.querySelector("#saveChallenge")?.addEventListener("click", () => {
  queueMicrotask(() => { void saveStateToAccount(); });
});
