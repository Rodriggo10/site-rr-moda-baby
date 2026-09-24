import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente do Supabase para uso exclusivo no servidor (API routes, server
 * components). Usa a service_role key, que ignora Row Level Security — por
 * isso NUNCA deve ser importado em código que roda no navegador.
 *
 * Criado sob demanda (não no carregamento do módulo) para que a ausência das
 * variáveis de ambiente durante a etapa de build não derrube o build inteiro
 * — o erro só acontece se alguma rota tentar de fato usar o Supabase.
 */
let cliente: SupabaseClient | null = null;

function obterCliente(): SupabaseClient {
  if (cliente) return cliente;

  const url = process.env.SUPABASE_URL;
  const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !chaveServico) {
    throw new Error(
      "Configuração ausente: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente."
    );
  }

  cliente = createClient(url, chaveServico, { auth: { persistSession: false } });
  return cliente;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_alvo, propriedade) {
    const alvoReal = obterCliente();
    const valor = Reflect.get(alvoReal, propriedade);
    return typeof valor === "function" ? valor.bind(alvoReal) : valor;
  },
});

export const BUCKET_PRODUTOS = "produtos";
