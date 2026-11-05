import { supabaseAdmin } from "./supabaseAdmin";

export interface Categoria {
  id: string;
  nome: string;
  imagem: string;
  ordem: number;
  totalProdutos?: number;
}

interface LinhaCategoria {
  id: string;
  nome: string;
  imagem: string;
  ordem: number;
}

export class ErroCategoria extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function normalizarNome(nome: unknown): string {
  const limpo = typeof nome === "string" ? nome.trim().replace(/\s+/g, " ") : "";
  if (!limpo) throw new ErroCategoria("Digite o nome da categoria.", 400);
  if (limpo.length > 60) throw new ErroCategoria("O nome pode ter no máximo 60 letras.", 400);
  return limpo;
}

async function garantirNomeLivre(nome: string, ignorarId?: string) {
  const { data, error } = await supabaseAdmin.from("categorias").select("id, nome");
  if (error) throw new Error(error.message);
  const existe = (data as { id: string; nome: string }[]).some(
    (c) => c.id !== ignorarId && c.nome.toLowerCase() === nome.toLowerCase()
  );
  if (existe) throw new ErroCategoria("Já existe uma categoria com esse nome.", 409);
}

export async function listarCategorias(comContagem = false): Promise<Categoria[]> {
  const { data, error } = await supabaseAdmin
    .from("categorias")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw new Error(error.message);
  const categorias = data as LinhaCategoria[];
  if (!comContagem) return categorias;

  const { data: produtos, error: erroProdutos } = await supabaseAdmin
    .from("produtos")
    .select("categoria");
  if (erroProdutos) throw new Error(erroProdutos.message);

  const contagem: Record<string, number> = {};
  for (const p of produtos as { categoria: string }[]) {
    contagem[p.categoria] = (contagem[p.categoria] ?? 0) + 1;
  }
  return categorias.map((c) => ({ ...c, totalProdutos: contagem[c.nome] ?? 0 }));
}

export async function criarCategoria(nomeBruto: unknown): Promise<Categoria> {
  const nome = normalizarNome(nomeBruto);
  await garantirNomeLivre(nome);

  const { data: ultima, error: erroOrdem } = await supabaseAdmin
    .from("categorias")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1);
  if (erroOrdem) throw new Error(erroOrdem.message);
  const proximaOrdem = (ultima?.[0]?.ordem ?? -1) + 1;

  const { data, error } = await supabaseAdmin
    .from("categorias")
    .insert({ nome, ordem: proximaOrdem })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as LinhaCategoria;
}

export async function atualizarCategoria(
  id: string,
  dados: { nome?: unknown; imagem?: unknown }
): Promise<Categoria> {
  const { data: atual, error: erroBusca } = await supabaseAdmin
    .from("categorias")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (erroBusca) throw new Error(erroBusca.message);
  if (!atual) throw new ErroCategoria("Categoria não encontrada.", 404);

  const campos: { nome?: string; imagem?: string } = {};
  if (dados.imagem !== undefined) {
    if (typeof dados.imagem !== "string") throw new ErroCategoria("Foto inválida.", 400);
    campos.imagem = dados.imagem;
  }

  let renomeou = false;
  if (dados.nome !== undefined) {
    const novoNome = normalizarNome(dados.nome);
    if (novoNome !== atual.nome) {
      await garantirNomeLivre(novoNome, id);
      campos.nome = novoNome;
      renomeou = true;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("categorias")
    .update(campos)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (renomeou) {
    const { error: erroProdutos } = await supabaseAdmin
      .from("produtos")
      .update({ categoria: campos.nome })
      .eq("categoria", atual.nome);
    if (erroProdutos) throw new Error(erroProdutos.message);
  }

  return data as LinhaCategoria;
}

/** Remove a categoria; os produtos dela ficam sem categoria. Retorna quantos produtos foram afetados. */
export async function excluirCategoria(id: string): Promise<number> {
  const { data: atual, error: erroBusca } = await supabaseAdmin
    .from("categorias")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (erroBusca) throw new Error(erroBusca.message);
  if (!atual) throw new ErroCategoria("Categoria não encontrada.", 404);

  const { data: afetados, error: erroProdutos } = await supabaseAdmin
    .from("produtos")
    .update({ categoria: "" })
    .eq("categoria", atual.nome)
    .select("id");
  if (erroProdutos) throw new Error(erroProdutos.message);

  const { error } = await supabaseAdmin.from("categorias").delete().eq("id", id);
  if (error) throw new Error(error.message);

  return afetados?.length ?? 0;
}

export async function reordenarCategorias(ids: string[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabaseAdmin.from("categorias").update({ ordem: i }).eq("id", ids[i]);
    if (error) throw new Error(error.message);
  }
}
