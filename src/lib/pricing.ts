import type { Produto } from "./types";

/** Regra de atacado da loja: a partir dessa quantidade total no carrinho,
 * todo o valor dos produtos (não o frete) recebe o desconto abaixo. */
export const QTD_MINIMA_ATACADO = 6;
export const DESCONTO_ATACADO = 0.2; // 20%

/** Preço unitário exibido para um produto (considera promoção, se houver). */
export function precoUnitario(produto: Produto): number {
  if (produto.promocao) {
    return produto.promocao.precoPor;
  }
  return produto.precoVarejo;
}

interface ItemParaTotais {
  precoUnitario: number;
  quantidade: number;
  participaAtacado: boolean;
}

export interface TotaisCarrinho {
  quantidadeTotal: number;
  quantidadeAtacado: number;
  subtotalSemDesconto: number;
  ehAtacado: boolean;
  valorDesconto: number;
  subtotal: number;
  faltamParaAtacado: number;
}

/** Calcula subtotal do carrinho aplicando o desconto de atacado por quantidade
 * de peças elegíveis (soma apenas dos produtos com participação no atacado
 * habilitada), quando atingido o mínimo. Produtos fora do atacado nunca
 * recebem o desconto nem contam para o mínimo. */
export function calcularTotaisCarrinho(itens: ItemParaTotais[]): TotaisCarrinho {
  const quantidadeTotal = itens.reduce((soma, i) => soma + i.quantidade, 0);
  const quantidadeAtacado = itens
    .filter((i) => i.participaAtacado)
    .reduce((soma, i) => soma + i.quantidade, 0);
  const subtotalSemDesconto = itens.reduce(
    (soma, i) => soma + i.precoUnitario * i.quantidade,
    0
  );
  const subtotalAtacado = itens
    .filter((i) => i.participaAtacado)
    .reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0);
  const ehAtacado = quantidadeAtacado >= QTD_MINIMA_ATACADO;
  const valorDesconto = ehAtacado ? subtotalAtacado * DESCONTO_ATACADO : 0;

  return {
    quantidadeTotal,
    quantidadeAtacado,
    subtotalSemDesconto,
    ehAtacado,
    valorDesconto,
    subtotal: subtotalSemDesconto - valorDesconto,
    faltamParaAtacado: Math.max(0, QTD_MINIMA_ATACADO - quantidadeAtacado),
  };
}

export type TipoCupom = "porcentagem" | "valor";

export interface RegraCupom {
  tipo: TipoCupom;
  valor: number;
}

/** Desconto do cupom sobre o valor dos produtos (nunca passa do próprio valor
 * dos produtos, e o frete não entra na conta). */
export function calcularDescontoCupom(cupom: RegraCupom, base: number): number {
  const bruto = cupom.tipo === "porcentagem" ? (base * cupom.valor) / 100 : cupom.valor;
  return Math.round(Math.min(bruto, base) * 100) / 100;
}

export function descreverCupom(cupom: RegraCupom): string {
  return cupom.tipo === "porcentagem"
    ? `${cupom.valor.toLocaleString("pt-BR")}% de desconto`
    : `${formatarMoeda(cupom.valor)} de desconto`;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
