import { NextRequest, NextResponse } from "next/server";
import { calcularFrete } from "@/lib/melhorEnvio";

export async function POST(request: NextRequest) {
  try {
    const { cepDestino, quantidadeItens, valorSegurado } = await request.json();

    if (!cepDestino || typeof cepDestino !== "string") {
      return NextResponse.json({ erro: "Informe o CEP de destino." }, { status: 400 });
    }

    const opcoes = await calcularFrete({
      cepDestino,
      quantidadeItens: Number(quantidadeItens) || 1,
      valorSegurado: Number(valorSegurado) || 0,
    });

    return NextResponse.json({ opcoes });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro ao calcular o frete.";
    return NextResponse.json({ erro: mensagem }, { status: 500 });
  }
}
