import { NextRequest, NextResponse } from "next/server";
import { ErroCategoria, atualizarCategoria, excluirCategoria } from "@/lib/categorias";

interface Params {
  params: Promise<{ id: string }>;
}

function responderErro(erro: unknown) {
  if (erro instanceof ErroCategoria) {
    return NextResponse.json({ erro: erro.message }, { status: erro.status });
  }
  throw erro;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { nome, imagem } = await request.json();
    const categoria = await atualizarCategoria(id, { nome, imagem });
    return NextResponse.json({ categoria });
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const produtosAfetados = await excluirCategoria(id);
    return NextResponse.json({ ok: true, produtosAfetados });
  } catch (erro) {
    return responderErro(erro);
  }
}
