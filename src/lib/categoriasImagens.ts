import { supabaseAdmin } from "./supabaseAdmin";

export async function listarImagensCategorias(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin.from("categorias_imagens").select("*");
  if (error) throw new Error(error.message);

  const mapa: Record<string, string> = {};
  for (const linha of data as { categoria: string; imagem: string }[]) {
    mapa[linha.categoria] = linha.imagem;
  }
  return mapa;
}

export async function definirImagemCategoria(categoria: string, imagem: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("categorias_imagens")
    .upsert({ categoria, imagem });
  if (error) throw new Error(error.message);
}
