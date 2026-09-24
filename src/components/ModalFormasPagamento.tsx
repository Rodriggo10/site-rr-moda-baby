"use client";

import { CreditCard, QrCode, Banknote, ShoppingBag, X } from "lucide-react";

const FORMAS = [
  { nome: "Pix", icone: QrCode, nota: null },
  { nome: "Cartão de Crédito", icone: CreditCard, nota: null },
  { nome: "Cartão de Débito", icone: CreditCard, nota: null },
  { nome: "Dinheiro", icone: Banknote, nota: "Apenas retirada local" },
];

export function ModalFormasPagamento({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-foreground/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Formas de Pagamento</h2>
            <p className="mt-1 text-sm text-foreground/60">
              Conheça os meios disponíveis para concluir seu pedido.
            </p>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground/10 text-foreground/50 transition hover:border-brand-pink hover:text-brand-pink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-brand-pink/5 p-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 font-bold text-foreground">
                <CreditCard size={18} className="text-brand-pink" /> Pagamento pelo WhatsApp
              </p>
              <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold text-brand-blue-dark">
                {FORMAS.length} formas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FORMAS.map(({ nome, icone: Icone, nota }) => (
                <div
                  key={nome}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-foreground/10 px-3 py-4 text-center"
                >
                  <Icone size={22} className="text-brand-pink-dark" />
                  <span className="text-xs font-bold text-foreground/80">{nome}</span>
                  {nota && (
                    <span className="-mt-1 text-[10px] font-semibold text-brand-orange">
                      {nota}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-foreground/50">
              O pagamento é combinado diretamente com a nossa equipe pelo WhatsApp, depois que você
              finalizar o pedido no carrinho.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-foreground/10 px-6 py-4">
          <button
            onClick={onFechar}
            className="flex items-center gap-2 rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink-dark"
          >
            <ShoppingBag size={16} /> Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
}
