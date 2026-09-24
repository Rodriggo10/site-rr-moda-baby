"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Tag } from "lucide-react";
import type { Produto } from "@/lib/types";
import { formatarMoeda } from "@/lib/pricing";

export function ProductCard({ produto }: { produto: Produto }) {
  const precoExibido = produto.promocao ? produto.promocao.precoPor : produto.precoVarejo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5 transition-shadow hover:shadow-xl"
    >
      <Link href={`/produto/${produto.id}`} className="relative block aspect-square overflow-hidden bg-brand-yellow/10">
        <Image
          src={produto.fotos[0] ?? "/produtos/placeholder.svg"}
          alt={produto.nome}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {produto.esgotado && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-bold text-white">
            Esgotado
          </span>
        )}
        {produto.promocao && !produto.esgotado && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-white">
            <Tag size={12} /> Promoção
          </span>
        )}

        <button
          type="button"
          aria-label="Favoritar produto"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-pink shadow transition hover:scale-110"
        >
          <Heart size={16} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-bold text-foreground">{produto.nome}</h3>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          {produto.promocao && (
            <span className="text-xs text-foreground/40 line-through">
              {formatarMoeda(produto.promocao.precoDe)}
            </span>
          )}
          <span className="text-lg font-extrabold text-brand-pink-dark">
            {formatarMoeda(precoExibido)}
          </span>
        </div>

        <Link
          href={`/produto/${produto.id}`}
          className="mt-3 inline-flex items-center justify-center rounded-full bg-brand-pink px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-pink-dark"
        >
          Ver produto
        </Link>
      </div>
    </motion.div>
  );
}
