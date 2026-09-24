import { NextRequest, NextResponse } from "next/server";
import { buscarClientePorId, paraPublico } from "@/lib/clientes";
import { validarTokenSessao, CLIENTE_COOKIE } from "@/lib/clienteAuth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CLIENTE_COOKIE)?.value;
  const clienteId = await validarTokenSessao(token);
  if (!clienteId) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const cliente = await buscarClientePorId(clienteId);
  if (!cliente) {
    return NextResponse.json({ erro: "Conta não encontrada." }, { status: 401 });
  }

  return NextResponse.json({ cliente: paraPublico(cliente) });
}
