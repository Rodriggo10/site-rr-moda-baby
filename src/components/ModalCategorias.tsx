"use client";

import { Check, X } from "lucide-react";
import { CATEGORIAS_LOJA } from "@/lib/categorias";

export function ModalCategorias({
  aberto,
  categoriaAtual,
  onSelecionar,
  onFechar,
}: {
  aberto: boolean;
  categoriaAtual: string;
  onSelecionar: (categoria: string) => void;
  onFechar: () => void;
}) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onFechar}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-foreground/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Escolha a categoria</h2>
            <p className="mt-1 text-sm text-foreground/60">
              Mesma lista que aparece na barra de categorias do site.
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

        <div className="overflow-y-auto p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIAS_LOJA.map((nome) => {
              const selecionada = nome === categoriaAtual;
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => onSelecionar(nome)}
                  className={`flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${
                    selecionada
                      ? "border-brand-pink bg-brand-pink/10 text-brand-pink-dark"
                      : "border-foreground/10 text-foreground/80 hover:border-brand-pink/50"
                  }`}
                >
                  {nome}
                  {selecionada && <Check size={16} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
