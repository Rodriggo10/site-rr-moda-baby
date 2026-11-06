import { supabaseAdmin } from "./supabaseAdmin";
import { formatarMoeda, type TipoCupom } from "./pricing";

export interface Cupom {
  id: string;
  codigo: string;
  tipo: TipoCupom;
  valor: number;
  validade: string | null; // AAAA-MM-DD (vale até o fim desse dia)
  limiteUsos: number | null;
  usos: number;
  pedidoMinimo: number | null;
  ativo: boolean;
  criadoEm: string;
}

interface LinhaCupom {
  id: string;
  codigo: string;
  tipo: TipoCupom;
  valor: number;
  validade: string | null;
  limite_usos: number | null;
  usos: number;
  pedido_minimo: number | null;
  ativo: boolean;
  criado_em: string;
}

export class ErroCupom extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function paraCupom(l: LinhaCupom): Cupom {
  return {
    id: l.id,
    codigo: l.codigo,
    tipo: l.tipo,
    valor: Number(l.valor),
    validade: l.validade,
    limiteUsos: l.limite_usos,
    usos: l.usos,
    pedidoMinimo: l.pedido_minimo === null ? null : Number(l.pedido_minimo),
    ativo: l.ativo,
    criadoEm: l.criado_em,
  };
}

export function normalizarCodigo(codigo: unknown): string {
  return typeof codigo === "string" ? codigo.toUpperCase().replace(/\s+/g, "") : "";
}

function hojeNoBrasil(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Belem" });
}

export function situacaoDoCupom(c: Cupom): "ativo" | "desativado" | "vencido" | "esgotado" {
  if (!c.ativo) return "desativado";
  if (c.validade && c.validade < hojeNoBrasil()) return "vencido";
  if (c.limiteUsos !== null && c.usos >= c.limiteUsos) return "esgotado";
  return "ativo";
}

function numeroOpcional(valor: unknown, rotulo: string): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  if (!Number.isFinite(n) || n < 0) throw new ErroCupom(`${rotulo} inválido.`, 400);
  return n;
}

export async function listarCupons(): Promise<Cupom[]> {
  const { data, error } = await supabaseAdmin
    .from("cupons")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as LinhaCupom[]).map(paraCupom);
}

export async function criarCupom(dados: Record<string, unknown>): Promise<Cupom> {
  const codigo = normalizarCodigo(dados.codigo);
  if (!/^[A-Z0-9_-]{3,20}$/.test(codigo)) {
    throw new ErroCupom(
      "O código deve ter de 3 a 20 caracteres, só letras, números, hífen ou _ (sem espaços).",
      400
    );
  }

  if (dados.tipo !== "porcentagem" && dados.tipo !== "valor") {
    throw new ErroCupom("Escolha se o desconto é em porcentagem ou valor fixo.", 400);
  }
  const valor = Number(dados.valor);
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new ErroCupom("Informe o valor do desconto.", 400);
  }
  if (dados.tipo === "porcentagem" && valor > 100) {
    throw new ErroCupom("A porcentagem não pode passar de 100%.", 400);
  }

  const limiteUsos = numeroOpcional(dados.limiteUsos, "Limite de usos");
  if (limiteUsos !== null && (!Number.isInteger(limiteUsos) || limiteUsos < 1)) {
    throw new ErroCupom("O limite de usos deve ser um número inteiro de 1 em diante.", 400);
  }
  const pedidoMinimo = numeroOpcional(dados.pedidoMinimo, "Pedido mínimo");

  let validade: string | null = null;
  if (typeof dados.validade === "string" && dados.validade) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.validade)) {
      throw new ErroCupom("Data de validade inválida.", 400);
    }
    validade = dados.validade;
  }

  const { data: existente, error: erroBusca } = await supabaseAdmin
    .from("cupons")
    .select("id")
    .eq("codigo", codigo)
    .maybeSingle();
  if (erroBusca) throw new Error(erroBusca.message);
  if (existente) throw new ErroCupom("Já existe um cupom com esse código.", 409);

  const { data, error } = await supabaseAdmin
    .from("cupons")
    .insert({
      codigo,
      tipo: dados.tipo,
      valor,
      validade,
      limite_usos: limiteUsos,
      pedido_minimo: pedidoMinimo,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return paraCupom(data as LinhaCupom);
}

export async function alterarAtivoCupom(id: string, ativo: unknown): Promise<Cupom> {
  if (typeof ativo !== "boolean") throw new ErroCupom("Dados inválidos.", 400);
  const { data, error } = await supabaseAdmin
    .from("cupons")
    .update({ ativo })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new ErroCupom("Cupom não encontrado.", 404);
  return paraCupom(data as LinhaCupom);
}

export async function excluirCupom(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("cupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function buscarCupomValido(codigoBruto: unknown, subtotal: unknown): Promise<Cupom> {
  const codigo = normalizarCodigo(codigoBruto);
  if (!codigo) throw new ErroCupom("Digite o código do cupom.", 400);

  const { data, error } = await supabaseAdmin
    .from("cupons")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const cupom = data ? paraCupom(data as LinhaCupom) : null;
  if (!cupom || !cupom.ativo) throw new ErroCupom("Cupom inválido.", 404);

  const situacao = situacaoDoCupom(cupom);
  if (situacao === "vencido") throw new ErroCupom("Esse cupom já venceu.", 410);
  if (situacao === "esgotado") {
    throw new ErroCupom("Esse cupom já atingiu o limite de usos.", 410);
  }

  const base = Number(subtotal);
  if (cupom.pedidoMinimo !== null && !(base >= cupom.pedidoMinimo)) {
    throw new ErroCupom(
      `Esse cupom vale para pedidos a partir de ${formatarMoeda(cupom.pedidoMinimo)} em produtos.`,
      422
    );
  }
  return cupom;
}

/** Confere se o cupom pode ser usado agora (não registra uso). */
export async function validarCupom(codigo: unknown, subtotal: unknown): Promise<Cupom> {
  return buscarCupomValido(codigo, subtotal);
}

/** Valida de novo e conta 1 uso (chamado quando o cliente envia o pedido). */
export async function registrarUsoCupom(codigo: unknown, subtotal: unknown): Promise<Cupom> {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const cupom = await buscarCupomValido(codigo, subtotal);
    const { data, error } = await supabaseAdmin
      .from("cupons")
      .update({ usos: cupom.usos + 1 })
      .eq("id", cupom.id)
      .eq("usos", cupom.usos) // só grava se ninguém usou nesse meio tempo
      .select("*");
    if (error) throw new Error(error.message);
    if (data && data.length > 0) return paraCupom(data[0] as LinhaCupom);
  }
  throw new ErroCupom("Não foi possível aplicar o cupom agora. Tente de novo.", 409);
}
