"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AjusteEstoque({ id, estoqueInicial }: { id: string; estoqueInicial: number }) {
  const [estoque, setEstoque] = useState(estoqueInicial);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  async function ajustar(delta: number) {
    const novoValor = Math.max(0, estoque + delta);
    if (novoValor === estoque) return;
    setEstoque(novoValor);
    setSalvando(true);
    await fetch(`/api/produtos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estoque: novoValor }),
    });
    setSalvando(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => ajustar(-1)}
        disabled={salvando || estoque <= 0}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-foreground/15 text-sm font-bold transition hover:border-brand-pink disabled:opacity-40"
      >
        −
      </button>
      <span className="w-6 text-center text-xs font-bold">{estoque}</span>
      <button
        type="button"
        onClick={() => ajustar(1)}
        disabled={salvando}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-foreground/15 text-sm font-bold transition hover:border-brand-pink disabled:opacity-40"
      >
        +
      </button>
      <span className="text-xs text-foreground/50">em estoque</span>
    </div>
  );
}
