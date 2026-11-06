import { NextRequest, NextResponse } from "next/server";
import { ErroCupom, validarCupom } from "@/lib/cupons";

// Rota pública da loja: confere um código digitado no carrinho.
export async function POST(request: NextRequest) {
  try {
    const { codigo, subtotal } = await request.json();
    const cupom = await validarCupom(codigo, subtotal);
    return NextResponse.json({
      cupom: {
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        valor: cupom.valor,
        pedidoMinimo: cupom.pedidoMinimo,
      },
    });
  } catch (erro) {
    if (erro instanceof ErroCupom) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    throw erro;
  }
}
