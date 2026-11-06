import { NextRequest, NextResponse } from "next/server";
import { ErroCupom, criarCupom, listarCupons, situacaoDoCupom } from "@/lib/cupons";

function responderErro(erro: unknown) {
  if (erro instanceof ErroCupom) {
    return NextResponse.json({ erro: erro.message }, { status: erro.status });
  }
  throw erro;
}

export async function GET() {
  const cupons = await listarCupons();
  return NextResponse.json({
    cupons: cupons.map((c) => ({ ...c, situacao: situacaoDoCupom(c) })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();
    const cupom = await criarCupom(dados);
    return NextResponse.json({ cupom: { ...cupom, situacao: situacaoDoCupom(cupom) } });
  } catch (erro) {
    return responderErro(erro);
  }
}
