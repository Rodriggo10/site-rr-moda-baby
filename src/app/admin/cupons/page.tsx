"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Cupom } from "@/lib/cupons";
import type { TipoCupom } from "@/lib/pricing";
import { descreverCupom, formatarMoeda } from "@/lib/pricing";

type Situacao = "ativo" | "desativado" | "vencido" | "esgotado";
type CupomComSituacao = Cupom & { situacao: Situacao };

const ROTULO_SITUACAO: Record<Situacao, string> = {
  ativo: "Ativo",
  desativado: "Desativado",
  vencido: "Vencido",
  esgotado: "Esgotado",
};

const COR_SITUACAO: Record<Situacao, string> = {
  ativo: "bg-brand-green/15 text-brand-green",
  desativado: "bg-foreground/10 text-foreground/60",
  vencido: "bg-brand-yellow/20 text-brand-pink-dark",
  esgotado: "bg-brand-yellow/20 text-brand-pink-dark",
};

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

const classeCampo =
  "w-full rounded-xl border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink";

export default function AdminCuponsPage() {
  const [cupons, setCupons] = useState<CupomComSituacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<TipoCupom>("porcentagem");
  const [valor, setValor] = useState("");
  const [validade, setValidade] = useState("");
  const [limiteUsos, setLimiteUsos] = useState("");
  const [pedidoMinimo, setPedidoMinimo] = useState("");

  useEffect(() => {
    fetch("/api/cupons")
      .then((r) => r.json())
      .then((json) => setCupons(json.cupons ?? []))
      .finally(() => setCarregando(false));
  }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const resposta = await fetch("/api/cupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          tipo,
          valor: valor.replace(",", "."),
          validade,
          limiteUsos,
          pedidoMinimo: pedidoMinimo.replace(",", "."),
        }),
      });
      const json = await resposta.json();
      if (!resposta.ok) {
        setErro(json.erro ?? "Erro ao criar o cupom.");
        return;
      }
      setCupons((atual) => [json.cupom, ...atual]);
      setCodigo("");
      setValor("");
      setValidade("");
      setLimiteUsos("");
      setPedidoMinimo("");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(cupom: CupomComSituacao) {
    setErro("");
    const resposta = await fetch(`/api/cupons/${cupom.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !cupom.ativo }),
    });
    const json = await resposta.json();
    if (!resposta.ok) {
      setErro(json.erro ?? "Erro ao atualizar o cupom.");
      return;
    }
    setCupons((atual) => atual.map((c) => (c.id === cupom.id ? json.cupom : c)));
  }

  async function excluir(cupom: CupomComSituacao) {
    if (!confirm(`Excluir o cupom "${cupom.codigo}"? Essa ação não pode ser desfeita.`)) return;
    setErro("");
    const resposta = await fetch(`/api/cupons/${cupom.id}`, { method: "DELETE" });
    if (!resposta.ok) {
      const json = await resposta.json();
      setErro(json.erro ?? "Erro ao excluir o cupom.");
      return;
    }
    setCupons((atual) => atual.filter((c) => c.id !== cupom.id));
  }

  if (carregando) {
    return <p className="text-foreground/60">Carregando cupons...</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold">Cupons de desconto</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Crie códigos de desconto para seus clientes digitarem no carrinho. O desconto vale só nos
        produtos (o frete não entra) e não acumula com o desconto de atacado.
      </p>

      <form
        onSubmit={criar}
        className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-xs font-bold text-foreground/60">Código do cupom *</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/\s/g, ""))}
            placeholder="Ex.: BEMVINDO10"
            maxLength={20}
            className={classeCampo}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-foreground/60">Tipo de desconto *</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoCupom)}
            className={classeCampo}
          >
            <option value="porcentagem">Porcentagem (%)</option>
            <option value="valor">Valor fixo (R$)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-foreground/60">
            {tipo === "porcentagem" ? "Quantos % de desconto? *" : "Quantos reais de desconto? *"}
          </label>
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            inputMode="decimal"
            placeholder={tipo === "porcentagem" ? "Ex.: 10" : "Ex.: 15,00"}
            className={classeCampo}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-foreground/60">
            Válido até (opcional)
          </label>
          <input
            type="date"
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            className={classeCampo}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-foreground/60">
            Limite de usos (opcional)
          </label>
          <input
            value={limiteUsos}
            onChange={(e) => setLimiteUsos(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="Ex.: 50 (vazio = sem limite)"
            className={classeCampo}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-foreground/60">
            Pedido mínimo em produtos, R$ (opcional)
          </label>
          <input
            value={pedidoMinimo}
            onChange={(e) => setPedidoMinimo(e.target.value)}
            inputMode="decimal"
            placeholder="Ex.: 100,00"
            className={classeCampo}
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={salvando || !codigo.trim() || !valor.trim()}
            className="flex items-center gap-1 rounded-full bg-brand-pink px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-pink-dark disabled:opacity-50"
          >
            <Plus size={16} /> {salvando ? "Criando..." : "Criar cupom"}
          </button>
        </div>
      </form>

      {erro && <p className="mb-4 text-sm font-semibold text-brand-pink-dark">{erro}</p>}

      {cupons.length === 0 && (
        <p className="text-foreground/60">Nenhum cupom ainda. Crie o primeiro acima.</p>
      )}

      <div className="flex flex-col gap-3">
        {cupons.map((cupom) => (
          <div
            key={cupom.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
          >
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold tracking-wide">{cupom.codigo}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${COR_SITUACAO[cupom.situacao]}`}
                >
                  {ROTULO_SITUACAO[cupom.situacao]}
                </span>
              </p>
              <p className="text-sm text-foreground/70">{descreverCupom(cupom)}</p>
              <p className="text-xs text-foreground/50">
                Usado {cupom.usos}
                {cupom.limiteUsos !== null ? ` de ${cupom.limiteUsos}` : ""}{" "}
                {cupom.usos === 1 ? "vez" : "vezes"}
                {cupom.validade ? ` · até ${formatarData(cupom.validade)}` : " · sem validade"}
                {cupom.pedidoMinimo !== null
                  ? ` · mínimo ${formatarMoeda(cupom.pedidoMinimo)}`
                  : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alternarAtivo(cupom)}
                className="rounded-full border-2 border-foreground/15 px-3 py-1.5 text-xs font-bold text-foreground/70 transition hover:border-brand-pink hover:text-brand-pink"
              >
                {cupom.ativo ? "Desativar" : "Ativar"}
              </button>
              <button
                type="button"
                onClick={() => excluir(cupom)}
                className="flex items-center gap-1 rounded-full border-2 border-foreground/15 px-3 py-1.5 text-xs font-bold text-foreground/60 transition hover:border-brand-pink hover:text-brand-pink"
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
