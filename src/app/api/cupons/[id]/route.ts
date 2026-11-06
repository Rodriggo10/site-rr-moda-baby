import { NextRequest, NextResponse } from "next/server";
import { ErroCupom, alterarAtivoCupom, excluirCupom, situacaoDoCupom } from "@/lib/cupons";

interface Params {
  params: Promise<{ id: string }>;
}

function responderErro(erro: unknown) {
  if (erro instanceof ErroCupom) {
    return NextResponse.json({ erro: erro.message }, { status: erro.status });
  }
  throw erro;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { ativo } = await request.json();
    const cupom = await alterarAtivoCupom(id, ativo);
    return NextResponse.json({ cupom: { ...cupom, situacao: situacaoDoCupom(cupom) } });
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await excluirCupom(id);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return responderErro(erro);
  }
}
