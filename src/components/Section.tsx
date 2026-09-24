import type { ReactNode } from "react";
import type { Produto } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function Section({
  titulo,
  icone,
  produtos,
  corFundo = "transparent",
}: {
  titulo: string;
  icone?: ReactNode;
  produtos: Produto[];
  corFundo?: string;
}) {
  if (produtos.length === 0) return null;

  return (
    <section className="py-10" style={{ background: corFundo }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          {icone}
          <h2 className="text-2xl font-extrabold text-foreground">{titulo}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      </div>
    </section>
  );
}
