import { NextRequest, NextResponse } from "next/server";
import { definirImagemCategoria, listarImagensCategorias } from "@/lib/categoriasImagens";

export async function GET() {
  const imagens = await listarImagensCategorias();
  return NextResponse.json({ imagens });
}

export async function PUT(request: NextRequest) {
  const { categoria, imagem } = await request.json();
  if (!categoria || typeof imagem !== "string") {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  await definirImagemCategoria(categoria, imagem);
  return NextResponse.json({ ok: true });
}
