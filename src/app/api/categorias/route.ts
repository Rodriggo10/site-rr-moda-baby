import { NextRequest, NextResponse } from "next/server";
import {
  ErroCategoria,
  criarCategoria,
  listarCategorias,
  reordenarCategorias,
} from "@/lib/categorias";

function responderErro(erro: unknown) {
  if (erro instanceof ErroCategoria) {
    return NextResponse.json({ erro: erro.message }, { status: erro.status });
  }
  throw erro;
}

export async function GET(request: NextRequest) {
  const comContagem = request.nextUrl.searchParams.get("contagem") === "1";
  const categorias = await listarCategorias(comContagem);
  return NextResponse.json({ categorias });
}

export async function POST(request: NextRequest) {
  try {
    const { nome } = await request.json();
    const categoria = await criarCategoria(nome);
    return NextResponse.json({ categoria });
  } catch (erro) {
    return responderErro(erro);
  }
}

export async function PUT(request: NextRequest) {
  const { ids } = await request.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  await reordenarCategorias(ids);
  return NextResponse.json({ ok: true });
}
