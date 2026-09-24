"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function BotaoExcluirProduto({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();

  async function excluir() {
    if (!confirm(`Excluir "${nome}"? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={excluir}
      className="flex items-center gap-1 rounded-full border-2 border-foreground/15 px-3 py-1.5 text-xs font-bold text-foreground/60 transition hover:border-brand-pink hover:text-brand-pink"
    >
      <Trash2 size={14} /> Excluir
    </button>
  );
}
