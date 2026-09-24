"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Package } from "lucide-react";
import type { Produto } from "@/lib/types";
import { QTD_MINIMA_ATACADO, formatarMoeda } from "@/lib/pricing";
import { useCart } from "@/lib/cart-context";

export function ProdutoDetalhe({ produto }: { produto: Produto }) {
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [tamanho, setTamanho] = useState(produto.tamanhos[0] ?? "");
  const [cor, setCor] = useState(produto.cores[0] ?? "");
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const { adicionarItem } = useCart();
  const router = useRouter();

  const precoExibido = produto.promocao ? produto.promocao.precoPor : produto.precoVarejo;

  function adicionarAoCarrinho() {
    adicionarItem({
      produtoId: produto.id,
      nome: produto.nome,
      tamanho,
      cor,
      quantidade,
      precoUnitario: precoExibido,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1800);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-brand-yellow/10 shadow-md">
            <Image
              src={produto.fotos[fotoAtiva] ?? "/produtos/placeholder.svg"}
              alt={produto.nome}
              fill
              className="object-cover"
            />
          </div>
          {produto.fotos.length > 1 && (
            <div className="mt-3 flex gap-2">
              {produto.fotos.map((foto, i) => (
                <button
                  key={foto + i}
                  onClick={() => setFotoAtiva(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded-xl ring-2 transition ${
                    i === fotoAtiva ? "ring-brand-pink" : "ring-transparent"
                  }`}
                >
                  <Image src={foto} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{produto.nome}</h1>
          <p className="mt-2 text-sm text-foreground/70">{produto.descricao}</p>

          <div className="mt-4 flex items-baseline gap-2">
            {produto.promocao && (
              <span className="text-sm text-foreground/40 line-through">
                {formatarMoeda(produto.promocao.precoDe)}
              </span>
            )}
            <span className="text-3xl font-extrabold text-brand-pink-dark">
              {formatarMoeda(precoExibido)}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-brand-blue-dark">
            <Package size={15} />
            Compre {QTD_MINIMA_ATACADO} peças ou mais (somando todo o carrinho) e ganhe 20% de
            desconto automático
          </p>

          {produto.tamanhos.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-bold text-foreground">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {produto.tamanhos.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTamanho(t)}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition ${
                      tamanho === t
                        ? "border-brand-pink bg-brand-pink text-white"
                        : "border-foreground/15 text-foreground/70 hover:border-brand-pink"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {produto.cores.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-foreground">Cor</p>
              <div className="flex flex-wrap gap-2">
                {produto.cores.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCor(c)}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition ${
                      cor === c
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-foreground/15 text-foreground/70 hover:border-brand-blue"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <p className="text-sm font-bold text-foreground">Quantidade</p>
            <div className="flex items-center rounded-full border-2 border-foreground/15">
              <button
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-lg font-bold"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">{quantidade}</span>
              <button
                onClick={() => setQuantidade((q) => q + 1)}
                className="px-3 py-1 text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {produto.esgotado ? (
            <div className="mt-8 rounded-2xl bg-foreground/10 px-4 py-3 text-center font-bold text-foreground/60">
              Produto esgotado no momento
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={adicionarAoCarrinho}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-pink px-6 py-3 font-bold text-white shadow-md transition hover:bg-brand-pink-dark"
              >
                {adicionado ? <Check size={18} /> : <ShoppingBag size={18} />}
                {adicionado ? "Adicionado!" : "Adicionar ao carrinho"}
              </button>
              <button
                onClick={() => {
                  adicionarAoCarrinho();
                  router.push("/carrinho");
                }}
                className="flex flex-1 items-center justify-center rounded-full border-2 border-brand-blue px-6 py-3 font-bold text-brand-blue-dark transition hover:bg-brand-blue hover:text-white"
              >
                Comprar agora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
