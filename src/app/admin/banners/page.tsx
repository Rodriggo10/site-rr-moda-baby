"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Info, Plus, Trash2 } from "lucide-react";
import type { Banner } from "@/lib/banners";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((json) => setBanners(json.banners ?? []))
      .finally(() => setCarregando(false));
  }

  async function adicionarBanner(arquivo: File) {
    setEnviando(true);
    setErro("");
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const resposta = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await resposta.json();
      if (!resposta.ok) throw new Error(json.erro ?? "Erro ao enviar foto.");

      const salvar = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: json.caminho }),
      });
      if (!salvar.ok) throw new Error("Erro ao salvar o banner.");
      const { banner } = await salvar.json();
      setBanners((atual) => [...atual, banner]);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setEnviando(false);
    }
  }

  async function excluirBanner(id: string) {
    if (!confirm("Remover esse banner do carrossel?")) return;
    setBanners((atual) => atual.filter((b) => b.id !== id));
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
  }

  async function moverBanner(indice: number, direcao: -1 | 1) {
    const novoIndice = indice + direcao;
    if (novoIndice < 0 || novoIndice >= banners.length) return;
    const novaOrdem = [...banners];
    [novaOrdem[indice], novaOrdem[novoIndice]] = [novaOrdem[novoIndice], novaOrdem[indice]];
    setBanners(novaOrdem);
    await fetch("/api/banners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: novaOrdem.map((b) => b.id) }),
    });
  }

  if (carregando) {
    return <p className="text-foreground/60">Carregando banners...</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold">Banners da página inicial</h1>
      <p className="mb-4 text-sm text-foreground/60">
        São as fotos grandes que ficam girando no topo da loja, logo abaixo do menu de busca.
      </p>

      <div className="mb-6 flex items-start gap-2 rounded-2xl bg-brand-blue/10 p-4 text-sm text-brand-blue-dark">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          <b>Tamanho recomendado da foto:</b> 1280 x 720 pixels (proporção 16:9), formato JPG ou
          PNG. A foto aparece inteira, sem cortar — se o tamanho for muito diferente disso, pode
          sobrar espaço vazio nas laterais.
        </p>
      </div>

      {erro && <p className="mb-4 text-sm font-semibold text-brand-pink-dark">{erro}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-brand-yellow/10">
              <Image src={banner.imagem} alt={`Banner ${i + 1}`} fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moverBanner(i, -1)}
                  disabled={i === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground/15 transition hover:border-brand-pink disabled:opacity-30"
                  aria-label="Mover para a esquerda"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moverBanner(i, 1)}
                  disabled={i === banners.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground/15 transition hover:border-brand-pink disabled:opacity-30"
                  aria-label="Mover para a direita"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => excluirBanner(banner.id)}
                className="flex items-center gap-1 rounded-full border-2 border-foreground/15 px-3 py-1.5 text-xs font-bold text-foreground/60 transition hover:border-brand-pink hover:text-brand-pink"
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground/20 text-foreground/50 transition hover:border-brand-pink hover:text-brand-pink disabled:opacity-50"
        >
          <Plus size={24} />
          <span className="text-sm font-bold">
            {enviando ? "Enviando..." : "Adicionar banner"}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) adicionarBanner(arquivo);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
