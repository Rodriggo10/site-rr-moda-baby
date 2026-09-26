import { supabaseAdmin } from "./supabaseAdmin";
import type { Produto } from "./types";

interface LinhaProduto {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  novidade: boolean;
  destaque: boolean;
  promocao: { precoDe: number; precoPor: number } | null;
  preco_varejo: number;
  estoque: number;
  participa_atacado: boolean;
  tamanhos: string[];
  cores: string[];
  fotos: string[];
  videos: string[];
  criado_em: string;
}

function paraProduto(linha: LinhaProduto): Produto {
  return {
    id: linha.id,
    nome: linha.nome,
    descricao: linha.descricao,
    categoria: linha.categoria,
    novidade: linha.novidade,
    destaque: linha.destaque,
    promocao: linha.promocao,
    precoVarejo: Number(linha.preco_varejo),
    estoque: Number(linha.estoque ?? 0),
    participaAtacado: linha.participa_atacado ?? true,
    tamanhos: linha.tamanhos ?? [],
    cores: linha.cores ?? [],
    fotos: linha.fotos ?? [],
    videos: linha.videos ?? [],
    criadoEm: linha.criado_em,
  };
}

function paraLinha(produto: Partial<Produto>) {
  const linha: Record<string, unknown> = {};
  if (produto.nome !== undefined) linha.nome = produto.nome;
  if (produto.descricao !== undefined) linha.descricao = produto.descricao;
  if (produto.categoria !== undefined) linha.categoria = produto.categoria;
  if (produto.novidade !== undefined) linha.novidade = produto.novidade;
  if (produto.destaque !== undefined) linha.destaque = produto.destaque;
  if (produto.promocao !== undefined) linha.promocao = produto.promocao;
  if (produto.precoVarejo !== undefined) linha.preco_varejo = produto.precoVarejo;
  if (produto.estoque !== undefined) linha.estoque = produto.estoque;
  if (produto.participaAtacado !== undefined) linha.participa_atacado = produto.participaAtacado;
  if (produto.tamanhos !== undefined) linha.tamanhos = produto.tamanhos;
  if (produto.cores !== undefined) linha.cores = produto.cores;
  if (produto.fotos !== undefined) linha.fotos = produto.fotos;
  if (produto.videos !== undefined) linha.videos = produto.videos;
  return linha;
}

export async function listarProdutos(): Promise<Produto[]> {
  const { data, error } = await supabaseAdmin
    .from("produtos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as LinhaProduto[]).map(paraProduto);
}

export async function buscarProduto(id: string): Promise<Produto | null> {
  const { data, error } = await supabaseAdmin
    .from("produtos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? paraProduto(data as LinhaProduto) : null;
}

export async function criarProduto(
  produto: Omit<Produto, "id" | "criadoEm">
): Promise<Produto> {
  const id = `${produto.nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

  const { data, error } = await supabaseAdmin
    .from("produtos")
    .insert({ id, ...paraLinha(produto) })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return paraProduto(data as LinhaProduto);
}

export async function atualizarProduto(
  id: string,
  dados: Partial<Produto>
): Promise<Produto | null> {
  const { data, error } = await supabaseAdmin
    .from("produtos")
    .update(paraLinha(dados))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? paraProduto(data as LinhaProduto) : null;
}

export async function excluirProduto(id: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("produtos")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}
