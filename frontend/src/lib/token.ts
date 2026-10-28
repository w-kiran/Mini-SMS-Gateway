const TOKEN_KEY = "msgw.token";
const EMAIL_KEY = "msgw.email";

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export interface StoredAuth {
  token: string | null;
  email: string | null;
}

export function readAuth(): StoredAuth {
  const ls = safeLocalStorage();
  if (!ls) return { token: null, email: null };
  return { token: ls.getItem(TOKEN_KEY), email: ls.getItem(EMAIL_KEY) };
}

export function saveAuth(token: string, email?: string | null): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  ls.setItem(TOKEN_KEY, token);
  if (email) ls.setItem(EMAIL_KEY, email);
}

export function clearAuth(): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  ls.removeItem(TOKEN_KEY);
  ls.removeItem(EMAIL_KEY);
}
