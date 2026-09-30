import { NextRequest, NextResponse } from "next/server";
import { criarBanner, listarBanners, reordenarBanners } from "@/lib/banners";

export async function GET() {
  const banners = await listarBanners();
  return NextResponse.json({ banners });
}

export async function POST(request: NextRequest) {
  const { imagem } = await request.json();
  if (!imagem || typeof imagem !== "string") {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  const banner = await criarBanner(imagem);
  return NextResponse.json({ banner });
}

export async function PUT(request: NextRequest) {
  const { ids } = await request.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  await reordenarBanners(ids);
  return NextResponse.json({ ok: true });
}
