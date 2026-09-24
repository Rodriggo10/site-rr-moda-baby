"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { NUMERO_WHATSAPP_LOJA } from "@/lib/whatsapp";

export function BotaoWhatsAppFlutuante() {
  const pathname = usePathname();
  const mensagem = encodeURIComponent(
    "Olá! Acessei o site da R&R Moda Baby e Infantil e gostaria de tirar uma dúvida."
  );

  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={`https://wa.me/${NUMERO_WHATSAPP_LOJA}?text=${mensagem}`}
      target="_blank"
      rel="noopener noreferrer"
      className="animar-flutuar fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-green px-4 py-3 font-bold text-white shadow-lg transition hover:brightness-95"
    >
      <MessageCircle size={20} />
      <span className="hidden sm:inline">Fale conosco</span>
    </a>
  );
}
