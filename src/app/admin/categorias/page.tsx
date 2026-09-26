"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { CATEGORIAS_LOJA } from "@/lib/categorias";

export default function AdminCategoriasPage() {
  const [imagens, setImagens] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/categorias-imagens")
      .then((r) => r.json())
      .then((json) => setImagens(json.imagens ?? {}))
      .finally(() => setCarregando(false));
  }, []);

  async function trocarFoto(categoria: string, arquivo: File) {
    setEnviando(categoria);
    setErro("");
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const resposta = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await resposta.json();
      if (!resposta.ok) throw new Error(json.erro ?? "Erro ao enviar foto.");

      const salvar = await fetch("/api/categorias-imagens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria, imagem: json.caminho }),
      });
      if (!salvar.ok) throw new Error("Erro ao salvar a foto da categoria.");

      setImagens((atual) => ({ ...atual, [categoria]: json.caminho }));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setEnviando(null);
    }
  }

  if (carregando) {
    return <p className="text-foreground/60">Carregando categorias...</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold">Fotos das categorias</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Essa é a foto que aparece na bolinha de cada categoria na página inicial da loja.
        Clique em uma categoria para trocar a foto.
      </p>

      {erro && <p className="mb-4 text-sm font-semibold text-brand-pink-dark">{erro}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {CATEGORIAS_LOJA.map((categoria) => {
          const imagem = imagens[categoria] || "/produtos/placeholder.svg";
          const estaEnviando = enviando === categoria;
          return (
            <div
              key={categoria}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5"
            >
              <button
                type="button"
                onClick={() => inputsRef.current[categoria]?.click()}
                disabled={estaEnviando}
                className="group relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-brand-pink transition hover:opacity-80"
              >
                <Image src={imagem} alt={categoria} fill className="object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <Upload size={18} className="text-white" />
                </span>
              </button>
              <input
                ref={(el) => {
                  inputsRef.current[categoria] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) trocarFoto(categoria, arquivo);
                  e.target.value = "";
                }}
              />
              <p className="text-xs font-bold">{categoria}</p>
              {estaEnviando && <p className="text-[10px] text-brand-blue-dark">Enviando...</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
