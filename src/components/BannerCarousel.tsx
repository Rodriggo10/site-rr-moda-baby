"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Banner } from "@/lib/banners";

const INTERVALO_MS = 4500;
const ASPECTO_PADRAO = "1543 / 672";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [indice, setIndice] = useState(0);
  const aspectosRef = useRef<Record<string, string>>({});
  const [aspecto, setAspecto] = useState(ASPECTO_PADRAO);

  useEffect(() => {
    if (banners.length < 2) return;
    const intervalo = setInterval(() => {
      setIndice((i) => (i + 1) % banners.length);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [banners.length]);

  useEffect(() => {
    const atual = banners[indice];
    if (!atual) return;
    setAspecto(aspectosRef.current[atual.imagem] ?? ASPECTO_PADRAO);
  }, [indice, banners]);

  if (banners.length === 0) return null;

  return (
    <div
      className="relative w-full transition-[aspect-ratio] duration-500"
      style={{ aspectRatio: aspecto }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={banners[indice].imagem}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={banners[indice].imagem}
            alt="R&R Confecções — Moda Baby e Infantil"
            fill
            priority={indice === 0}
            quality={90}
            className="object-contain"
            sizes="100vw"
            onLoad={(e) => {
              const img = e.currentTarget;
              const razao = `${img.naturalWidth} / ${img.naturalHeight}`;
              aspectosRef.current[banners[indice].imagem] = razao;
              setAspecto(razao);
            }}
          />
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Ver banner ${i + 1}`}
              onClick={() => setIndice(i)}
              className={`h-2 rounded-full transition-all ${
                i === indice ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
