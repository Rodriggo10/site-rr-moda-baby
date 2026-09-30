import { supabaseAdmin } from "./supabaseAdmin";

export interface Banner {
  id: string;
  imagem: string;
  ordem: number;
}

interface LinhaBanner {
  id: string;
  imagem: string;
  ordem: number;
}

export async function listarBanners(): Promise<Banner[]> {
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) throw new Error(error.message);
  return data as LinhaBanner[];
}

export async function criarBanner(imagem: string): Promise<Banner> {
  const { data: existentes, error: erroContagem } = await supabaseAdmin
    .from("banners")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1);

  if (erroContagem) throw new Error(erroContagem.message);
  const proximaOrdem = (existentes?.[0]?.ordem ?? -1) + 1;

  const { data, error } = await supabaseAdmin
    .from("banners")
    .insert({ imagem, ordem: proximaOrdem })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as LinhaBanner;
}

export async function excluirBanner(id: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.from("banners").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function reordenarBanners(ids: string[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabaseAdmin.from("banners").update({ ordem: i }).eq("id", ids[i]);
    if (error) throw new Error(error.message);
  }
}
