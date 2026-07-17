/**
 * Supabase Auth client — inicializado lazily via /api/config.
 * Usado APENAS para autenticação (signUp, session).
 * Operações de banco de dados continuam via supabase-local (Express API).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _initPromise: Promise<SupabaseClient> | null = null;

async function initClient(): Promise<SupabaseClient> {
  if (_client) return _client;
  const res = await fetch("/api/config");
  const { supabaseUrl, supabaseAnonKey } = await res.json() as {
    supabaseUrl: string;
    supabaseAnonKey: string;
  };
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase não configurado no servidor.");
  }
  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

/** Retorna (e cacheia) o cliente Supabase Auth. */
export function getSupabaseAuth(): Promise<SupabaseClient> {
  if (!_initPromise) _initPromise = initClient();
  return _initPromise;
}

/**
 * Dispara o e-mail de confirmação do Supabase Auth para o endereço fornecido.
 * Cria um usuário anônimo só para acionar o fluxo de e-mail — a senha é aleatória
 * e nunca exposta ao participante.
 */
export async function triggerSupabaseConfirmation(
  email: string,
  name: string,
  redirectOrigin: string,
): Promise<{ error: string | null }> {
  try {
    const client = await getSupabaseAuth();
    const { error } = await client.auth.signUp({
      email,
      password: crypto.randomUUID(),           // senha aleatória, nunca usada
      options: {
        data: { full_name: name },
        emailRedirectTo: `${redirectOrigin}/confirmar`,
      },
    });
    if (error) {
      // "User already registered" é OK — significa que já enviamos antes
      if (error.message?.toLowerCase().includes("already registered")) {
        return { error: null };
      }
      console.error("[SUPABASE AUTH]", error.message);
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    console.error("[SUPABASE AUTH EXCEPTION]", err);
    return { error: err.message };
  }
}

/**
 * Verifica o token/hash de confirmação que o Supabase injeta na URL de retorno.
 * Suporta tanto o fluxo implícito (#access_token) quanto o PKCE (?code=).
 * Retorna o e-mail do usuário confirmado, ou null se falhar.
 */
export async function verifySupabaseCallback(): Promise<{
  email: string | null;
  error: string | null;
}> {
  try {
    const client = await getSupabaseAuth();

    // 1. Fluxo PKCE: ?code= na query string
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (error) return { email: null, error: error.message };
      return { email: data.session?.user?.email ?? null, error: null };
    }

    // 2. Fluxo com token_hash (link de e-mail direto)
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if (tokenHash && type) {
      const { data, error } = await client.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any,
      });
      if (error) return { email: null, error: error.message };
      return { email: data.session?.user?.email ?? null, error: null };
    }

    // 3. Fluxo implícito: #access_token no hash
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get("access_token");
    if (accessToken) {
      const { data } = await client.auth.getSession();
      return { email: data.session?.user?.email ?? null, error: null };
    }

    return { email: null, error: "Nenhum token de confirmação encontrado na URL." };
  } catch (err: any) {
    return { email: null, error: err.message };
  }
}
