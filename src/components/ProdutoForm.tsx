"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2, Upload } from "lucide-react";
import type { Produto } from "@/lib/types";
import { ModalCategorias } from "./ModalCategorias";

type Rascunho = Omit<Produto, "id" | "criadoEm">;

const RASCUNHO_VAZIO: Rascunho = {
  nome: "",
  descricao: "",
  categoria: "",
  novidade: true,
  destaque: false,
  promocao: null,
  precoVarejo: 0,
  estoque: 0,
  participaAtacado: true,
  tamanhos: [],
  cores: [],
  fotos: [],
  videos: [],
};

export function ProdutoForm({ produto }: { produto?: Produto }) {
  const [dados, setDados] = useState<Rascunho>(produto ?? RASCUNHO_VAZIO);
  const [tamanhosTexto, setTamanhosTexto] = useState((produto?.tamanhos ?? []).join(", "));
  const [coresTexto, setCoresTexto] = useState((produto?.cores ?? []).join(", "));
  const [temPromocao, setTemPromocao] = useState(!!produto?.promocao);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function enviarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviandoArquivo(true);
    setErro("");
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const resposta = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await resposta.json();
      if (!resposta.ok) throw new Error(json.erro ?? "Erro ao enviar arquivo.");

      const ehVideo = /\.(mp4|mov|webm)$/i.test(json.caminho);
      setDados((d) => ({
        ...d,
        fotos: ehVideo ? d.fotos : [...d.fotos, json.caminho],
        videos: ehVideo ? [...d.videos, json.caminho] : d.videos,
      }));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar arquivo.");
    } finally {
      setEnviandoArquivo(false);
      if (inputArquivoRef.current) inputArquivoRef.current.value = "";
    }
  }

  function removerFoto(foto: string) {
    setDados((d) => ({ ...d, fotos: d.fotos.filter((f) => f !== foto) }));
  }

  function removerVideo(video: string) {
    setDados((d) => ({ ...d, videos: d.videos.filter((v) => v !== video) }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!dados.nome.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }

    const payload: Rascunho = {
      ...dados,
      tamanhos: tamanhosTexto.split(",").map((t) => t.trim()).filter(Boolean),
      cores: coresTexto.split(",").map((c) => c.trim()).filter(Boolean),
      promocao: temPromocao ? dados.promocao : null,
    };

    setEnviando(true);
    try {
      const url = produto ? `/api/produtos/${produto.id}` : "/api/produtos";
      const method = produto ? "PUT" : "POST";
      const resposta = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resposta.ok) {
        const json = await resposta.json();
        throw new Error(json.erro ?? "Erro ao salvar produto.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar produto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      <div>
        <label className="mb-1 block text-sm font-bold">Nome do produto</label>
        <input
          value={dados.nome}
          onChange={(e) => setDados((d) => ({ ...d, nome: e.target.value }))}
          className="w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold">Descrição</label>
        <textarea
          value={dados.descricao}
          onChange={(e) => setDados((d) => ({ ...d, descricao: e.target.value }))}
          rows={3}
          className="w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold">Categoria</label>
          <button
            type="button"
            onClick={() => setModalCategoriaAberto(true)}
            className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-2 text-left text-sm outline-none transition ${
              dados.categoria ? "border-foreground/15 text-foreground" : "border-foreground/15 text-foreground/40"
            } hover:border-brand-pink`}
          >
            {dados.categoria || "Selecione uma categoria"}
            <ChevronDown size={16} className="shrink-0 text-foreground/40" />
          </button>
          <ModalCategorias
            aberto={modalCategoriaAberto}
            categoriaAtual={dados.categoria}
            onSelecionar={(categoria) => {
              setDados((d) => ({ ...d, categoria }));
              setModalCategoriaAberto(false);
            }}
            onFechar={() => setModalCategoriaAberto(false)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold">Preço varejo (R$)</label>
          <input
            type="number"
            step="0.01"
            value={dados.precoVarejo || ""}
            onChange={(e) => setDados((d) => ({ ...d, precoVarejo: e.target.value === "" ? 0 : Number(e.target.value) }))}
            className="w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold">Quantidade em estoque</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDados((d) => ({ ...d, estoque: Math.max(0, d.estoque - 1) }))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-foreground/15 text-lg font-bold transition hover:border-brand-pink"
            >
              −
            </button>
            <input
              type="number"
              min="0"
              step="1"
              value={dados.estoque || ""}
              onChange={(e) =>
                setDados((d) => ({
                  ...d,
                  estoque: e.target.value === "" ? 0 : Math.max(0, Math.floor(Number(e.target.value))),
                }))
              }
              className="w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-center text-sm outline-none focus:border-brand-pink"
            />
            <button
              type="button"
              onClick={() => setDados((d) => ({ ...d, estoque: d.estoque + 1 }))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-foreground/15 text-lg font-bold transition hover:border-brand-pink"
            >
              +
            </button>
          </div>
          <p className="mt-1 text-xs text-foreground/50">
            {dados.estoque <= 0 ? "Sem peças — aparece como esgotado no site" : `${dados.estoque} peça(s) disponível(is) para venda`}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-blue/5 p-4 text-sm text-brand-blue-dark">
        <p className="mb-3">
          <b>Regra de atacado da loja:</b> a partir de 6 peças elegíveis no carrinho (somando
          os produtos marcados abaixo), o cliente ganha 20% de desconto automático nessas
          peças.
        </p>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={dados.participaAtacado}
            onChange={(e) => setDados((d) => ({ ...d, participaAtacado: e.target.checked }))}
          />
          Este produto entra no atacado
        </label>
        <p className="mt-1 text-xs text-brand-blue-dark/70">
          {dados.participaAtacado
            ? "Conta para o mínimo de 6 peças e recebe os 20% de desconto."
            : "Não conta para o mínimo e nunca recebe o desconto de atacado — sempre vendido no preço de varejo."}
        </p>
      </div>

      <div className="rounded-2xl bg-brand-orange/5 p-4">
        <label className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-orange">
          <input
            type="checkbox"
            checked={temPromocao}
            onChange={(e) => setTemPromocao(e.target.checked)}
          />
          Produto em promoção
        </label>
        {temPromocao && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground/60">
                Preço "de" (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={dados.promocao?.precoDe || ""}
                onChange={(e) =>
                  setDados((d) => ({
                    ...d,
                    promocao: {
                      precoDe: e.target.value === "" ? 0 : Number(e.target.value),
                      precoPor: d.promocao?.precoPor ?? 0,
                    },
                  }))
                }
                className="w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground/60">
                Preço "por" (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={dados.promocao?.precoPor || ""}
                onChange={(e) =>
                  setDados((d) => ({
                    ...d,
                    promocao: {
                      precoDe: d.promocao?.precoDe ?? 0,
                      precoPor: e.target.value === "" ? 0 : Number(e.target.value),
                    },
                  }))
                }
                className="w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-orange"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold">Tamanhos (separe por vírgula)</label>
          <input
            value={tamanhosTexto}
            onChange={(e) => setTamanhosTexto(e.target.value)}
            placeholder="Ex: 1, 2, 4, 6"
            className="w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold">Cores (separe por vírgula)</label>
          <input
            value={coresTexto}
            onChange={(e) => setCoresTexto(e.target.value)}
            placeholder="Ex: Rosa, Azul, Branco"
            className="w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={dados.novidade}
            onChange={(e) => setDados((d) => ({ ...d, novidade: e.target.checked }))}
          />
          Aparece em Novidades
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={dados.destaque}
            onChange={(e) => setDados((d) => ({ ...d, destaque: e.target.checked }))}
          />
          Aparece em Mais vendidos
        </label>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold">Fotos e vídeos</label>
        <div className="flex flex-wrap gap-3">
          {dados.fotos.map((foto) => (
            <div key={foto} className="relative h-24 w-24 overflow-hidden rounded-xl ring-1 ring-black/10">
              <Image src={foto} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removerFoto(foto)}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-brand-pink"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {dados.videos.map((video) => (
            <div
              key={video}
              className="relative flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl bg-foreground/5 text-xs ring-1 ring-black/10"
            >
              🎬 vídeo
              <button
                type="button"
                onClick={() => removerVideo(video)}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-brand-pink"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => inputArquivoRef.current?.click()}
            disabled={enviandoArquivo}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-foreground/20 text-xs font-semibold text-foreground/50 transition hover:border-brand-pink hover:text-brand-pink disabled:opacity-60"
          >
            <Upload size={18} />
            {enviandoArquivo ? "Enviando..." : "Adicionar"}
          </button>
          <input
            ref={inputArquivoRef}
            type="file"
            accept="image/*,video/*"
            onChange={enviarArquivo}
            className="hidden"
          />
        </div>
      </div>

      {erro && <p className="text-sm font-semibold text-brand-pink-dark">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="self-start rounded-full bg-brand-pink px-8 py-3 font-bold text-white shadow-md transition hover:bg-brand-pink-dark disabled:opacity-60"
      >
        {enviando ? "Salvando..." : produto ? "Salvar alterações" : "Cadastrar produto"}
      </button>
    </form>
  );
}
