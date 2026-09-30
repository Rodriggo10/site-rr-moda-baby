import { NextRequest, NextResponse } from "next/server";
import { excluirBanner } from "@/lib/banners";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = await excluirBanner(id);
  if (!ok) {
    return NextResponse.json({ erro: "Banner não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
