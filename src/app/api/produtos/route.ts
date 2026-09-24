import { NextRequest, NextResponse } from "next/server";
import { criarProduto, listarProdutos } from "@/lib/catalog";

export async function GET() {
  const produtos = await listarProdutos();
  return NextResponse.json({ produtos });
}

export async function POST(request: NextRequest) {
  const dados = await request.json();
  const produto = await criarProduto(dados);
  return NextResponse.json({ produto }, { status: 201 });
}
