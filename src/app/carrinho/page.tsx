"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus, Package, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { QTD_MINIMA_ATACADO, calcularTotaisCarrinho, formatarMoeda } from "@/lib/pricing";
import { montarMensagemPedido, linkWhatsApp } from "@/lib/whatsapp";
import { useConta } from "@/lib/useConta";
import type { OpcaoFrete } from "@/lib/melhorEnvio";

function formatarCep(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);
  if (numeros.length <= 5) return numeros;
  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

function classeInput(comErro: boolean) {
  return `rounded-full border-2 px-4 py-2 text-sm outline-none transition ${
    comErro
      ? "border-brand-pink focus:border-brand-pink"
      : "border-foreground/15 focus:border-brand-pink"
  }`;
}

export default function CarrinhoPage() {
  const { itens, removerItem, atualizarQuantidade } = useCart();
  const { cliente } = useConta();

  const [nome, setNome] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const [camposInvalidos, setCamposInvalidos] = useState<Record<string, boolean>>({});
  const [mostrarAvisoObrigatorios, setMostrarAvisoObrigatorios] = useState(false);

  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [erroFrete, setErroFrete] = useState("");

  useEffect(() => {
    if (!cliente) return;
    setNome((atual) => atual || cliente.nome);
    if (cliente.endereco) {
      setCep((atual) => atual || cliente.endereco!.cep);
      setRua((atual) => atual || cliente.endereco!.rua);
      setNumero((atual) => atual || cliente.endereco!.numero);
      setComplemento((atual) => atual || cliente.endereco!.complemento);
      setBairro((atual) => atual || cliente.endereco!.bairro);
      setCidade((atual) => atual || cliente.endereco!.cidade);
      setEstado((atual) => atual || cliente.endereco!.estado);
    }
  }, [cliente]);

  const totais = calcularTotaisCarrinho(itens);
  const totalItens = totais.quantidadeTotal;
  const valorFrete = freteSelecionado ? Number(freteSelecionado.preco) : 0;
  const totalComFrete = totais.subtotal + valorFrete;

  async function aoSairDoCep() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setErroCep("");
    setBuscandoCep(true);
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();
      if (dados.erro) {
        setErroCep("CEP não encontrado. Preencha o endereço manualmente.");
      } else {
        setRua(dados.logradouro || "");
        setBairro(dados.bairro || "");
        setCidade(dados.localidade || "");
        setEstado(dados.uf || "");
      }
    } catch {
      setErroCep("Não foi possível buscar o CEP. Preencha o endereço manualmente.");
    } finally {
      setBuscandoCep(false);
    }

    calcularFrete(cepLimpo);
  }

  async function calcularFrete(cepParaCalculo?: string) {
    const alvo = (cepParaCalculo ?? cep).replace(/\D/g, "");
    setErroFrete("");
    setOpcoesFrete([]);
    setFreteSelecionado(null);
    if (alvo.length !== 8) {
      setErroFrete("Digite um CEP válido (8 números).");
      return;
    }
    setCalculandoFrete(true);
    try {
      const resposta = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: alvo,
          quantidadeItens: totalItens,
          valorSegurado: totais.subtotal,
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro ?? "Erro ao calcular o frete.");
      const opcoes: OpcaoFrete[] = dados.opcoes;
      setOpcoesFrete(opcoes);
      if (opcoes.length === 0) {
        setErroFrete("Nenhuma opção de frete encontrada para esse CEP.");
      } else {
        const maisBarata = [...opcoes].sort((a, b) => Number(a.preco) - Number(b.preco))[0];
        setFreteSelecionado(maisBarata);
      }
    } catch (erro) {
      setErroFrete(erro instanceof Error ? erro.message : "Erro ao calcular o frete.");
    } finally {
      setCalculandoFrete(false);
    }
  }

  function enderecoFormatado() {
    const partes = [
      rua && numero ? `${rua}, ${numero}` : rua || numero,
      complemento,
      bairro,
      cidade && estado ? `${cidade}/${estado}` : cidade || estado,
      cep ? `CEP ${cep}` : "",
    ].filter(Boolean);
    return partes.join(" - ");
  }

  function validarCamposObrigatorios() {
    const erros: Record<string, boolean> = {
      nome: !nome.trim(),
      cep: cep.replace(/\D/g, "").length !== 8,
      rua: !rua.trim(),
      numero: !numero.trim(),
      bairro: !bairro.trim(),
      cidade: !cidade.trim(),
      estado: !estado.trim(),
    };
    setCamposInvalidos(erros);
    return !Object.values(erros).some(Boolean);
  }

  function finalizarNoWhatsApp() {
    if (!validarCamposObrigatorios()) {
      setMostrarAvisoObrigatorios(true);
      return;
    }
    setMostrarAvisoObrigatorios(false);

    const mensagem = montarMensagemPedido(
      { nome: nome || "(não informado)", endereco: enderecoFormatado() || "(não informado)" },
      itens,
      freteSelecionado
        ? {
            transportadora: freteSelecionado.transportadora,
            nome: freteSelecionado.nome,
            preco: Number(freteSelecionado.preco),
            prazoDias: freteSelecionado.prazoDias,
          }
        : null
    );
    window.open(linkWhatsApp(mensagem), "_blank");
  }

  if (itens.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-brand-pink" />
        <h1 className="text-xl font-extrabold">Seu carrinho está vazio</h1>
        <Link
          href="/"
          className="rounded-full bg-brand-pink px-6 py-3 font-bold text-white transition hover:bg-brand-pink-dark"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold">Seu carrinho</h1>

      <div className="space-y-4">
        {itens.map((item) => (
          <div
            key={`${item.produtoId}-${item.tamanho}-${item.cor}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
          >
            <div>
              <p className="font-bold">{item.nome}</p>
              <p className="text-sm text-foreground/60">
                Tam. {item.tamanho} · Cor {item.cor}
              </p>
              <p className="text-sm font-semibold text-brand-pink-dark">
                {formatarMoeda(item.precoUnitario)} / un.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border-2 border-foreground/15">
                <button
                  onClick={() =>
                    atualizarQuantidade(
                      item.produtoId,
                      item.tamanho,
                      item.cor,
                      Math.max(1, item.quantidade - 1)
                    )
                  }
                  className="p-2"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantidade}</span>
                <button
                  onClick={() =>
                    atualizarQuantidade(item.produtoId, item.tamanho, item.cor, item.quantidade + 1)
                  }
                  className="p-2"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => removerItem(item.produtoId, item.tamanho, item.cor)}
                className="text-foreground/40 transition hover:text-brand-pink"
                aria-label="Remover item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-6 flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold ${
          totais.ehAtacado
            ? "bg-brand-green/10 text-brand-green"
            : "bg-brand-yellow/15 text-brand-pink-dark"
        }`}
      >
        <Package size={20} className="shrink-0" />
        {totais.ehAtacado ? (
          <span>
            Preço de atacado aplicado! {totais.quantidadeAtacado} peças elegíveis no carrinho
            — 20% de desconto nessas peças.
          </span>
        ) : (
          <span>
            Faltam {totais.faltamParaAtacado}{" "}
            {totais.faltamParaAtacado === 1 ? "peça" : "peças"} elegíveis para o preço de
            atacado: a partir de {QTD_MINIMA_ATACADO} peças, 20% de desconto automático nos
            produtos participantes!
          </span>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="mb-1 font-bold">Seus dados para entrega</p>
        <p className="mb-3 text-xs text-foreground/50">Todos os campos abaixo são obrigatórios (complemento é opcional).</p>

        <div className="flex flex-col gap-3">
          <input
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setCamposInvalidos((c) => ({ ...c, nome: false }));
            }}
            placeholder="Seu nome completo *"
            className={classeInput(camposInvalidos.nome)}
          />

          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <div>
              <input
                value={cep}
                onChange={(e) => {
                  setCep(formatarCep(e.target.value));
                  setCamposInvalidos((c) => ({ ...c, cep: false }));
                }}
                onBlur={aoSairDoCep}
                placeholder="CEP *"
                inputMode="numeric"
                className={`w-full ${classeInput(camposInvalidos.cep)}`}
              />
              {buscandoCep && (
                <p className="mt-1 text-xs text-foreground/50">Buscando endereço...</p>
              )}
              {erroCep && <p className="mt-1 text-xs text-brand-pink-dark">{erroCep}</p>}
            </div>
            <input
              value={rua}
              onChange={(e) => {
                setRua(e.target.value);
                setCamposInvalidos((c) => ({ ...c, rua: false }));
              }}
              placeholder="Rua / Logradouro *"
              className={classeInput(camposInvalidos.rua)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={numero}
              onChange={(e) => {
                setNumero(e.target.value);
                setCamposInvalidos((c) => ({ ...c, numero: false }));
              }}
              placeholder="Número *"
              className={classeInput(camposInvalidos.numero)}
            />
            <input
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              placeholder="Complemento (opcional)"
              className={classeInput(false)}
            />
          </div>

          <input
            value={bairro}
            onChange={(e) => {
              setBairro(e.target.value);
              setCamposInvalidos((c) => ({ ...c, bairro: false }));
            }}
            placeholder="Bairro *"
            className={classeInput(camposInvalidos.bairro)}
          />

          <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
            <input
              value={cidade}
              onChange={(e) => {
                setCidade(e.target.value);
                setCamposInvalidos((c) => ({ ...c, cidade: false }));
              }}
              placeholder="Cidade *"
              className={classeInput(camposInvalidos.cidade)}
            />
            <input
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value.toUpperCase().slice(0, 2));
                setCamposInvalidos((c) => ({ ...c, estado: false }));
              }}
              placeholder="UF *"
              className={`text-center ${classeInput(camposInvalidos.estado)}`}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-brand-blue/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 font-bold text-brand-blue-dark">
            <Truck size={18} /> Frete
          </p>
          <button
            onClick={() => calcularFrete()}
            disabled={calculandoFrete}
            className="rounded-full bg-brand-blue px-4 py-1.5 text-xs font-bold text-white transition hover:bg-brand-blue-dark disabled:opacity-60"
          >
            {calculandoFrete ? "Calculando..." : "Recalcular"}
          </button>
        </div>
        <p className="text-xs text-foreground/50">
          Preenchido automaticamente a partir do CEP informado acima. Escolha a opção desejada.
        </p>
        {erroFrete && <p className="mt-2 text-sm text-brand-pink-dark">{erroFrete}</p>}
        {opcoesFrete.length > 0 && (
          <ul className="mt-3 space-y-2">
            {opcoesFrete.map((op) => {
              const selecionada = freteSelecionado?.id === op.id;
              return (
                <li key={op.id}>
                  <button
                    type="button"
                    onClick={() => setFreteSelecionado(op)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-2.5 text-left text-sm shadow-sm transition ${
                      selecionada
                        ? "border-brand-blue bg-white"
                        : "border-transparent bg-white hover:border-brand-blue/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          selecionada ? "border-brand-blue bg-brand-blue text-white" : "border-foreground/20"
                        }`}
                      >
                        {selecionada && <Check size={12} />}
                      </span>
                      {op.transportadora} — {op.nome} ({op.prazoDias} dias úteis)
                    </span>
                    <span className="font-bold">{formatarMoeda(Number(op.preco))}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-8 space-y-1">
        <div className="flex items-center justify-between text-sm text-foreground/60">
          <span>Subtotal</span>
          <span>{formatarMoeda(totais.subtotalSemDesconto)}</span>
        </div>
        {totais.ehAtacado && (
          <div className="flex items-center justify-between text-sm font-semibold text-brand-green">
            <span>Desconto atacado (20%)</span>
            <span>-{formatarMoeda(totais.valorDesconto)}</span>
          </div>
        )}
        {freteSelecionado && (
          <div className="flex items-center justify-between text-sm text-foreground/60">
            <span>Frete ({freteSelecionado.nome})</span>
            <span>{formatarMoeda(valorFrete)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-lg font-extrabold">
          <span>Total</span>
          <span className="text-brand-pink-dark">{formatarMoeda(totalComFrete)}</span>
        </div>
      </div>

      {mostrarAvisoObrigatorios && (
        <p className="mt-3 text-center text-sm font-semibold text-brand-pink-dark">
          Preencha nome, CEP, rua, número, bairro, cidade e estado para continuar.
        </p>
      )}

      <button
        onClick={finalizarNoWhatsApp}
        className="mt-4 w-full rounded-full bg-brand-green px-6 py-4 text-center text-lg font-extrabold text-white shadow-md transition hover:brightness-95"
      >
        Finalizar pedido no WhatsApp
      </button>
    </div>
  );
}
