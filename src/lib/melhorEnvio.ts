const MELHOR_ENVIO_URL =
  "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate";

export interface OpcaoFrete {
  id: number;
  nome: string;
  preco: string;
  prazoDias: number;
  transportadora: string;
  erro?: string;
}

interface CalcularFreteParams {
  cepDestino: string;
  quantidadeItens: number;
  valorSegurado: number;
}

/**
 * Calcula o frete via Melhor Envio a partir do CEP de origem da loja (env
 * ORIGIN_CEP) até o CEP informado pelo cliente.
 *
 * Observação: as dimensões/peso do pacote usam uma estimativa padrão para
 * roupa infantil dobrada (por peça). Quando o catálogo real tiver peso e
 * dimensões por produto, troque os valores fixos abaixo pelo cálculo real.
 */
export async function calcularFrete({
  cepDestino,
  quantidadeItens,
  valorSegurado,
}: CalcularFreteParams): Promise<OpcaoFrete[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const cepOrigem = process.env.ORIGIN_CEP;

  if (!token || !cepOrigem) {
    throw new Error(
      "Configuração ausente: defina MELHOR_ENVIO_TOKEN e ORIGIN_CEP no .env.local"
    );
  }

  const pesoEstimadoKg = Math.max(0.3, 0.3 * quantidadeItens);

  const resposta = await fetch(MELHOR_ENVIO_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "RR Moda Baby e Infantil (contato via WhatsApp)",
    },
    body: JSON.stringify({
      from: { postal_code: cepOrigem.replace(/\D/g, "") },
      to: { postal_code: cepDestino.replace(/\D/g, "") },
      products: [
        {
          id: "carrinho",
          width: 20,
          height: 10,
          length: 25,
          weight: pesoEstimadoKg,
          insurance_value: valorSegurado,
          quantity: 1,
        },
      ],
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Melhor Envio retornou erro HTTP ${resposta.status}`);
  }

  const dados = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("Resposta inesperada do Melhor Envio");
  }

  return dados
    .filter((opcao) => !opcao.error)
    .map((opcao) => ({
      id: opcao.id,
      nome: opcao.name,
      preco: opcao.price,
      prazoDias: opcao.delivery_time,
      transportadora: opcao.company?.name ?? "",
    }));
}
