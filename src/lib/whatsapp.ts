import type { ItemCarrinho } from "./types";
import { calcularTotaisCarrinho, formatarMoeda, precoUnitario } from "./pricing";

export const NUMERO_WHATSAPP_LOJA = "5591984905919"; // (91) 98490-5919

interface DadosCliente {
  nome: string;
  endereco: string;
}

export interface FreteEscolhido {
  transportadora: string;
  nome: string;
  preco: number;
  prazoDias: number;
}

export function montarMensagemPedido(
  cliente: DadosCliente,
  itens: ItemCarrinho[],
  frete?: FreteEscolhido | null
): string {
  const linhas: string[] = [];

  linhas.push("Olá! Gostaria de fazer o seguinte pedido:");
  linhas.push("");
  linhas.push(`Nome: ${cliente.nome}`);
  linhas.push(`Endereço: ${cliente.endereco}`);
  linhas.push("");

  for (const item of itens) {
    const subtotal = item.precoUnitario * item.quantidade;
    linhas.push(
      `${item.quantidade}x ${item.nome} - Tam. ${item.tamanho} - Cor ${item.cor} - ${formatarMoeda(
        item.precoUnitario
      )} (un.) = ${formatarMoeda(subtotal)}`
    );
  }

  const totais = calcularTotaisCarrinho(itens);

  if (totais.ehAtacado) {
    linhas.push("");
    linhas.push(
      `Desconto atacado (${totais.quantidadeTotal} peças, 20%): -${formatarMoeda(
        totais.valorDesconto
      )}`
    );
  }

  let total = totais.subtotal;

  if (frete) {
    total += frete.preco;
    linhas.push("");
    linhas.push(
      `Frete: ${frete.transportadora} — ${frete.nome} (${frete.prazoDias} dias úteis) - ${formatarMoeda(
        frete.preco
      )}`
    );
  }

  linhas.push("");
  linhas.push(`Total: ${formatarMoeda(total)}`);

  return linhas.join("\n");
}

export function linkWhatsApp(mensagem: string): string {
  const texto = encodeURIComponent(mensagem);
  return `https://wa.me/${NUMERO_WHATSAPP_LOJA}?text=${texto}`;
}

export { precoUnitario };
