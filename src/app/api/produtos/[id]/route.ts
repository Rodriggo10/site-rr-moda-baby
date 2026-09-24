import { NextRequest, NextResponse } from "next/server";
import { atualizarProduto, buscarProduto, excluirProduto } from "@/lib/catalog";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const produto = await buscarProduto(id);
  if (!produto) {
    return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ produto });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const dados = await request.json();
  const produto = await atualizarProduto(id, dados);
  if (!produto) {
    return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ produto });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = await excluirProduto(id);
  if (!ok) {
    return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
