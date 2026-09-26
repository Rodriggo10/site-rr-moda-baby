"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIAS_LOJA } from "@/lib/categorias";

export function CategoriasDestaque({ imagens }: { imagens: Record<string, string> }) {
  const categorias = CATEGORIAS_LOJA.map((nome) => ({
    nome,
    imagem: imagens[nome] || "/produtos/placeholder.svg",
  }));
  const trilhoRef = useRef<HTMLDivElement>(null);
  const arrastando = useRef(false);
  const inicioX = useRef(0);
  const scrollInicial = useRef(0);
  const moveu = useRef(false);

  const [ativo, setAtivo] = useState(false);

  function aoIniciarArraste(e: React.MouseEvent) {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    arrastando.current = true;
    moveu.current = false;
    setAtivo(true);
    inicioX.current = e.pageX - trilho.offsetLeft;
    scrollInicial.current = trilho.scrollLeft;
  }

  function aoMoverArraste(e: React.MouseEvent) {
    const trilho = trilhoRef.current;
    if (!arrastando.current || !trilho) return;
    e.preventDefault();
    const x = e.pageX - trilho.offsetLeft;
    const distancia = x - inicioX.current;
    if (Math.abs(distancia) > 3) moveu.current = true;
    trilho.scrollLeft = scrollInicial.current - distancia;
  }

  function pararArraste() {
    arrastando.current = false;
    setAtivo(false);
  }

  function aoClicarLink(e: React.MouseEvent) {
    // Evita disparar a navegação quando o clique fazia parte de um arraste
    if (moveu.current) e.preventDefault();
  }

  return (
    <div className="border-y border-black/5 bg-brand-blue-dark py-6">
      <div className="mx-auto max-w-6xl">
        <div
          ref={trilhoRef}
          onMouseDown={aoIniciarArraste}
          onMouseMove={aoMoverArraste}
          onMouseUp={pararArraste}
          onMouseLeave={pararArraste}
          className={`sem-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-visible scroll-smooth select-none px-6 py-2 sm:gap-8 sm:px-10 ${
            ativo ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {categorias.map((categoria) => (
            <Link
              key={categoria.nome}
              href={`/?categoria=${encodeURIComponent(categoria.nome)}`}
              onClick={aoClicarLink}
              draggable={false}
              className="group flex w-20 shrink-0 snap-start flex-col items-center gap-2 text-center sm:w-24"
            >
              <span className="relative block h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-pink transition group-hover:ring-brand-yellow sm:h-20 sm:w-20">
                <Image
                  src={categoria.imagem}
                  alt={categoria.nome}
                  fill
                  draggable={false}
                  className="pointer-events-none object-cover"
                />
              </span>
              <span className="text-xs font-bold text-white sm:text-sm">
                {categoria.nome}
              </span>
            </Link>
          ))}
          <div className="w-48 shrink-0 sm:w-64" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
