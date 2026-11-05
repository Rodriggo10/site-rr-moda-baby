"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react";
import type { Categoria } from "@/lib/categorias";

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nomesEditados, setNomesEditados] = useState<Record<string, string>>({});
  const [novoNome, setNovoNome] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviandoFoto, setEnviandoFoto] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/categorias?contagem=1")
      .then((r) => r.json())
      .then((json) => setCategorias(json.categorias ?? []))
      .finally(() => setCarregando(false));
  }, []);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const resposta = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome }),
    });
    const json = await resposta.json();
    if (!resposta.ok) {
      setErro(json.erro ?? "Erro ao criar a categoria.");
      return;
    }
    setCategorias((atual) => [...atual, { ...json.categoria, totalProdutos: 0 }]);
    setNovoNome("");
  }

  async function renomear(categoria: Categoria) {
    const nome = (nomesEditados[categoria.id] ?? categoria.nome).trim();
    if (nome === categoria.nome) {
      setNomesEditados(({ [categoria.id]: _descartado, ...resto }) => resto);
      return;
    }
    setErro("");
    const resposta = await fetch(`/api/categorias/${categoria.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    const json = await resposta.json();
    if (!resposta.ok) {
      setErro(json.erro ?? "Erro ao renomear a categoria.");
      setNomesEditados(({ [categoria.id]: _descartado, ...resto }) => resto);
      return;
    }
    setCategorias((atual) =>
      atual.map((c) => (c.id === categoria.id ? { ...c, nome: json.categoria.nome } : c))
    );
    setNomesEditados(({ [categoria.id]: _descartado, ...resto }) => resto);
  }

  async function trocarFoto(categoria: Categoria, arquivo: File) {
    setEnviandoFoto(categoria.id);
    setErro("");
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const resposta = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await resposta.json();
      if (!resposta.ok) throw new Error(json.erro ?? "Erro ao enviar foto.");

      const salvar = await fetch(`/api/categorias/${categoria.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: json.caminho }),
      });
      if (!salvar.ok) throw new Error("Erro ao salvar a foto da categoria.");

      setCategorias((atual) =>
        atual.map((c) => (c.id === categoria.id ? { ...c, imagem: json.caminho } : c))
      );
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setEnviandoFoto(null);
    }
  }

  async function excluir(categoria: Categoria) {
    const total = categoria.totalProdutos ?? 0;
    const aviso =
      total > 0
        ? `Excluir a categoria "${categoria.nome}"? Os ${total} produto(s) dela vão ficar sem categoria (você pode escolher outra categoria depois, editando cada produto).`
        : `Excluir a categoria "${categoria.nome}"?`;
    if (!confirm(aviso)) return;

    setErro("");
    const resposta = await fetch(`/api/categorias/${categoria.id}`, { method: "DELETE" });
    if (!resposta.ok) {
      const json = await resposta.json();
      setErro(json.erro ?? "Erro ao excluir a categoria.");
      return;
    }
    setCategorias((atual) => atual.filter((c) => c.id !== categoria.id));
  }

  async function mover(indice: number, direcao: -1 | 1) {
    const novoIndice = indice + direcao;
    if (novoIndice < 0 || novoIndice >= categorias.length) return;
    const novaOrdem = [...categorias];
    [novaOrdem[indice], novaOrdem[novoIndice]] = [novaOrdem[novoIndice], novaOrdem[indice]];
    setCategorias(novaOrdem);
    await fetch("/api/categorias", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: novaOrdem.map((c) => c.id) }),
    });
  }

  if (carregando) {
    return <p className="text-foreground/60">Carregando categorias...</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold">Categorias da loja</h1>
      <p className="mb-6 text-sm text-foreground/60">
        São as bolinhas que aparecem na página inicial e a lista usada ao cadastrar um produto.
        Aqui você cria, renomeia, troca a foto, muda a ordem ou exclui categorias.
      </p>

      <form onSubmit={adicionar} className="mb-4 flex flex-wrap gap-2">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome da nova categoria"
          maxLength={60}
          className="min-w-0 flex-1 rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />
        <button
          type="submit"
          disabled={!novoNome.trim()}
          className="flex items-center gap-1 rounded-full bg-brand-pink px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-pink-dark disabled:opacity-50"
        >
          <Plus size={16} /> Adicionar
        </button>
      </form>

      {erro && <p className="mb-4 text-sm font-semibold text-brand-pink-dark">{erro}</p>}

      {categorias.length === 0 && (
        <p className="text-foreground/60">Nenhuma categoria ainda. Crie a primeira acima.</p>
      )}

      <div className="flex flex-col gap-3">
        {categorias.map((categoria, i) => (
          <div
            key={categoria.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5"
          >
            <button
              type="button"
              onClick={() => inputsRef.current[categoria.id]?.click()}
              disabled={enviandoFoto === categoria.id}
              className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-pink transition hover:opacity-80"
              aria-label={`Trocar a foto de ${categoria.nome}`}
            >
              <Image
                src={categoria.imagem || "/produtos/placeholder.svg"}
                alt={categoria.nome}
                fill
                className="object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                <Upload size={16} className="text-white" />
              </span>
            </button>
            <input
              ref={(el) => {
                inputsRef.current[categoria.id] = el;
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

            <div className="min-w-0 flex-1">
              <input
                value={nomesEditados[categoria.id] ?? categoria.nome}
                onChange={(e) =>
                  setNomesEditados((atual) => ({ ...atual, [categoria.id]: e.target.value }))
                }
                onBlur={() => renomear(categoria)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                maxLength={60}
                aria-label="Nome da categoria"
                className="w-full rounded-lg border-2 border-transparent px-2 py-1 text-sm font-bold outline-none hover:border-foreground/10 focus:border-brand-pink"
              />
              <p className="px-2 text-xs text-foreground/50">
                {enviandoFoto === categoria.id
                  ? "Enviando foto..."
                  : `${categoria.totalProdutos ?? 0} produto(s)`}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => mover(i, -1)}
                disabled={i === 0}
                aria-label="Subir"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground/15 transition hover:border-brand-pink disabled:opacity-30"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => mover(i, 1)}
                disabled={i === categorias.length - 1}
                aria-label="Descer"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground/15 transition hover:border-brand-pink disabled:opacity-30"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => excluir(categoria)}
                className="ml-1 flex items-center gap-1 rounded-full border-2 border-foreground/15 px-3 py-1.5 text-xs font-bold text-foreground/60 transition hover:border-brand-pink hover:text-brand-pink"
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
