/**
 * Typed API client.
 * Em desenvolvimento local usa /api (proxy do Vite ou Replit dev).
 * Em produção no Vercel usa VITE_API_BASE_URL que aponta para a API deployada.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "") + "/api";

function getToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      signal: controller.signal,
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
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Servidor demorou para responder. Tente novamente.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get:    <T>(path: string)                => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: "DELETE" }),
};
