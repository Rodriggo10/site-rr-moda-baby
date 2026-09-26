"use client";

import { motion } from "framer-motion";
import { BannerCarousel } from "./BannerCarousel";
import { CategoriasDestaque } from "./CategoriasDestaque";

export function Hero({ imagensCategorias }: { imagensCategorias: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue/15 via-white to-white">
      <BannerCarousel />

      <CategoriasDestaque imagens={imagensCategorias} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center"
        >
          <h1 className="text-2xl font-extrabold text-brand-pink-dark sm:text-3xl">
            Enxoval para o bebê, kids e teen 💕
          </h1>
          <p className="text-sm text-foreground/70 sm:text-base">
            Escolha as roupinhas, adicione ao carrinho e finalize seu pedido direto no
            WhatsApp — rápido, fácil e sem complicação.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
