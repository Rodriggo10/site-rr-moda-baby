export const CLIENTE_COOKIE = "rr_cliente_session";

function segredo(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-secret-troque-isso";
}

async function assinar(valor: string): Promise<string> {
  const enc = new TextEncoder();
  const chave = await crypto.subtle.importKey(
    "raw",
    enc.encode(segredo()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const assinatura = await crypto.subtle.sign("HMAC", chave, enc.encode(valor));
  return Array.from(new Uint8Array(assinatura))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function criarTokenSessao(clienteId: string): Promise<string> {
  return `${clienteId}.${await assinar(clienteId)}`;
}

export async function validarTokenSessao(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const [clienteId, assinatura] = token.split(".");
  if (!clienteId || !assinatura) return null;
  const esperado = await assinar(clienteId);
  return assinatura === esperado ? clienteId : null;
}

export async function hashSenha(senha: string): Promise<string> {
  const enc = new TextEncoder().encode(senha);
  const buffer = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
