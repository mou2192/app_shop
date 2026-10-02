/**
 * إعداد Supabase للواجهة.
 * مفتاح anon مصمم ليظهر في المتصفح، لكنه لا يمنح صلاحيات وحده.
 * لا تضع service_role_key هنا أبدًا.
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qobwwszmfrxitlibpnws.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvYnd3c3ptZnJ4aXRsaWJwbndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTc5NjIsImV4cCI6MjEwNjQ3Mzk2Mn0.y50jQwWDKCGR77dLMQomQ6jQEck8BdsO2xxHo1_3e_Q";

const SESSION_KEY = "debtbook-supabase-session";
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Supabase Auth يتطلب بريدًا؛ نحول اسم المستخدم إلى بريد داخلي ثابت لا يظهر للعميل.
export const usernameEmail = (username: string) => `user${username.trim()}@debtbook.app`;

export type SupabaseSession = { access_token: string; refresh_token?: string; user?: { id: string; email?: string } };

export function getSupabaseSession(): SupabaseSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error_description || payload.msg || payload.message || "تعذر تسجيل الدخول");
  return payload as T;
}

export async function signInWithUsername(username: string, password: string) {
  const session = await authRequest<SupabaseSession>("token?grant_type=password", { email: usernameEmail(username), password });
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signUpWithUsername(username: string, password: string) {
  const session = await authRequest<SupabaseSession>("signup", { email: usernameEmail(username), password, data: { username } });
  if (session.access_token) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOutSupabase() { localStorage.removeItem(SESSION_KEY); }

export async function supabaseRequest<T>(table: string, options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: string; body?: unknown } = {}): Promise<T> {
  const session = getSupabaseSession();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${options.query ?? ""}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.method === "POST" ? "return=representation" : "return=minimal",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) { const detail = await response.text(); throw new Error(`Supabase ${response.status}: ${detail}`); }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const supabaseTables = { clients: "debtbook_clients", products: "debtbook_products", invoices: "debtbook_invoices", invoiceLines: "debtbook_invoice_lines" } as const;
