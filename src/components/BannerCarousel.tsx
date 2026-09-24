"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const BANNERS = [
  {
    src: "/marca/capa.jpg",
    alt: "R&R Confecções — Moda Baby e Infantil — Varejo e Atacado",
    posicao: "center",
  },
  { src: "/marca/capa3.jpg", alt: "R&R Confecções — Moda Baby e Infantil", posicao: "center" },
  { src: "/marca/capa4.jpg", alt: "R&R Confecções — Moda Baby e Infantil", posicao: "center top" },
];

const INTERVALO_MS = 4500;

export function BannerCarousel() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((i) => (i + 1) % BANNERS.length);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="relative w-full" style={{ aspectRatio: "1543 / 672" }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={BANNERS[indice].src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={BANNERS[indice].src}
            alt={BANNERS[indice].alt}
            fill
            priority={indice === 0}
            quality={90}
            className="object-cover"
            style={{ objectPosition: BANNERS[indice].posicao }}
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {BANNERS.map((banner, i) => (
          <button
            key={banner.src}
            type="button"
            aria-label={`Ver banner ${i + 1}`}
            onClick={() => setIndice(i)}
            className={`h-2 rounded-full transition-all ${
              i === indice ? "w-6 bg-white" : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
