/**
 * إعداد Supabase للواجهة.
 * مفتاح anon مصمم ليظهر في المتصفح، لكنه لا يمنح صلاحيات وحده.
 * لا تضع service_role_key هنا أبدًا.
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qobwwszmfrxitlibpnws.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvYnd3c3ptZnJ4aXRsaWJwbndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTc5NjIsImV4cCI6MjEwNjQ3Mzk2Mn0.y50jQwWDKCGR77dLMQomQ6jQEck8BdsO2xxHo1_3e_Q";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export async function supabaseRequest<T>(
  table: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${options.query ?? ""}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.method === "POST" ? "return=representation" : "return=minimal",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${response.status}: ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const supabaseTables = {
  clients: "debtbook_clients",
  products: "debtbook_products",
  invoices: "debtbook_invoices",
  invoiceLines: "debtbook_invoice_lines",
} as const;
