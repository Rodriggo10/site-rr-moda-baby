import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !chaveServico) {
  throw new Error(
    "Configuração ausente: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local"
  );
}

/**
 * Cliente do Supabase para uso exclusivo no servidor (API routes, server
 * components). Usa a service_role key, que ignora Row Level Security — por
 * isso NUNCA deve ser importado em código que roda no navegador.
 */
export const supabaseAdmin = createClient(url, chaveServico, {
  auth: { persistSession: false },
});

export const BUCKET_PRODUTOS = "produtos";
