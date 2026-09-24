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
}

export interface TotaisCarrinho {
  quantidadeTotal: number;
  subtotalSemDesconto: number;
  ehAtacado: boolean;
  valorDesconto: number;
  subtotal: number;
  faltamParaAtacado: number;
}

/** Calcula subtotal do carrinho aplicando o desconto de atacado por quantidade
 * total de peças (soma de todos os produtos), quando atingido o mínimo. */
export function calcularTotaisCarrinho(itens: ItemParaTotais[]): TotaisCarrinho {
  const quantidadeTotal = itens.reduce((soma, i) => soma + i.quantidade, 0);
  const subtotalSemDesconto = itens.reduce(
    (soma, i) => soma + i.precoUnitario * i.quantidade,
    0
  );
  const ehAtacado = quantidadeTotal >= QTD_MINIMA_ATACADO;
  const valorDesconto = ehAtacado ? subtotalSemDesconto * DESCONTO_ATACADO : 0;

  return {
    quantidadeTotal,
    subtotalSemDesconto,
    ehAtacado,
    valorDesconto,
    subtotal: subtotalSemDesconto - valorDesconto,
    faltamParaAtacado: Math.max(0, QTD_MINIMA_ATACADO - quantidadeTotal),
  };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
