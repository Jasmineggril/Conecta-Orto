/**
 * Minimal typed API client for direct REST calls to /api.
 * Used by admin components and new public pages.
 */

const API_BASE = "/api";

function getToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(opts?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let msg = "Erro na requisição";
    try {
      const err = await res.json();
      msg = err.error ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)     => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: "DELETE" }),
};
