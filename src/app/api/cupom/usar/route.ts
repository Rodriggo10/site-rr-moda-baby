import { NextRequest, NextResponse } from "next/server";
import { ErroCupom, registrarUsoCupom } from "@/lib/cupons";

// Rota pública da loja: conta 1 uso quando o cliente envia o pedido pelo WhatsApp.
export async function POST(request: NextRequest) {
  try {
    const { codigo, subtotal } = await request.json();
    await registrarUsoCupom(codigo, subtotal);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    if (erro instanceof ErroCupom) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    throw erro;
  }
}
