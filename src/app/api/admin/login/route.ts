import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, senhaValida, tokenEsperado } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { senha } = await request.json();

  if (!senhaValida(senha)) {
    return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
  }

  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(ADMIN_COOKIE, await tokenEsperado(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
  return resposta;
}

export async function DELETE() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.delete(ADMIN_COOKIE);
  return resposta;
}
