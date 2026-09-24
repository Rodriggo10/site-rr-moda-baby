import { NextRequest, NextResponse } from "next/server";
import { buscarClientePorEmail, criarCliente, paraPublico } from "@/lib/clientes";
import { criarTokenSessao, hashSenha, CLIENTE_COOKIE } from "@/lib/clienteAuth";

export async function POST(request: NextRequest) {
  const { nome, email, telefone, senha } = await request.json();

  if (!nome?.trim() || !email?.trim() || !senha || senha.length < 6) {
    return NextResponse.json(
      { erro: "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  const existente = await buscarClientePorEmail(email);
  if (existente) {
    return NextResponse.json({ erro: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  const cliente = await criarCliente({
    nome: nome.trim(),
    email: email.trim(),
    telefone: telefone?.trim() ?? "",
    senhaHash: await hashSenha(senha),
  });

  const resposta = NextResponse.json({ cliente: paraPublico(cliente) }, { status: 201 });
  resposta.cookies.set(CLIENTE_COOKIE, await criarTokenSessao(cliente.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return resposta;
}
