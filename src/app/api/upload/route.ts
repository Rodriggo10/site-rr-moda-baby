import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { supabaseAdmin, BUCKET_PRODUTOS } from "@/lib/supabaseAdmin";

const EXTENSOES_PERMITIDAS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp4",
  ".mov",
  ".webm",
];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const arquivo = formData.get("arquivo");

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const extensao = path.extname(arquivo.name).toLowerCase();
  if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
    return NextResponse.json(
      { erro: "Tipo de arquivo não permitido. Envie foto (jpg, png, webp) ou vídeo (mp4, mov, webm)." },
      { status: 400 }
    );
  }

  const TAMANHO_MAXIMO_MB = 50;
  if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    return NextResponse.json(
      { erro: `Arquivo maior que ${TAMANHO_MAXIMO_MB}MB.` },
      { status: 400 }
    );
  }

  const nomeArquivo = `${randomUUID()}${extensao}`;
  const bytes = Buffer.from(await arquivo.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_PRODUTOS)
    .upload(nomeArquivo, bytes, {
      contentType: arquivo.type || undefined,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ erro: `Erro ao enviar arquivo: ${error.message}` }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET_PRODUTOS).getPublicUrl(nomeArquivo);

  return NextResponse.json({ caminho: data.publicUrl });
}
