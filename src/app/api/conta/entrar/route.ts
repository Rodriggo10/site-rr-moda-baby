import { NextRequest, NextResponse } from "next/server";
import { buscarClientePorEmail, paraPublico } from "@/lib/clientes";
import { criarTokenSessao, hashSenha, CLIENTE_COOKIE } from "@/lib/clienteAuth";

export async function POST(request: NextRequest) {
  const { email, senha } = await request.json();

  if (!email?.trim() || !senha) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  const cliente = await buscarClientePorEmail(email);
  if (!cliente || cliente.senhaHash !== (await hashSenha(senha))) {
    return NextResponse.json({ erro: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const resposta = NextResponse.json({ cliente: paraPublico(cliente) });
  resposta.cookies.set(CLIENTE_COOKIE, await criarTokenSessao(cliente.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return resposta;
}

export async function DELETE() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.delete(CLIENTE_COOKIE);
  return resposta;
}
