export const ADMIN_COOKIE = "rr_admin_session";

async function sha256(texto: string): Promise<string> {
  const dados = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function tokenEsperado(): Promise<string> {
  const senha = process.env.ADMIN_PASSWORD ?? "";
  return sha256(senha);
}

export function senhaValida(senhaDigitada: string): boolean {
  return senhaDigitada === (process.env.ADMIN_PASSWORD ?? "");
}
