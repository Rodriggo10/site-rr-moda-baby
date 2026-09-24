import { NextRequest, NextResponse } from "next/server";
import { atualizarEnderecoCliente, paraPublico } from "@/lib/clientes";
import { validarTokenSessao, CLIENTE_COOKIE } from "@/lib/clienteAuth";

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(CLIENTE_COOKIE)?.value;
  const clienteId = await validarTokenSessao(token);
  if (!clienteId) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const endereco = await request.json();
  const cliente = await atualizarEnderecoCliente(clienteId, endereco);
  if (!cliente) {
    return NextResponse.json({ erro: "Conta não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ cliente: paraPublico(cliente) });
}
