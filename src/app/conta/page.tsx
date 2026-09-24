"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, User } from "lucide-react";
import { useConta } from "@/lib/useConta";

function formatarCep(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);
  if (numeros.length <= 5) return numeros;
  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

export default function ContaPage() {
  const { cliente, carregando, setCliente } = useConta();
  const router = useRouter();

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  useEffect(() => {
    if (!carregando && !cliente) {
      router.replace("/conta/entrar");
    }
  }, [carregando, cliente, router]);

  useEffect(() => {
    if (cliente?.endereco) {
      setCep(cliente.endereco.cep);
      setRua(cliente.endereco.rua);
      setNumero(cliente.endereco.numero);
      setComplemento(cliente.endereco.complemento);
      setBairro(cliente.endereco.bairro);
      setCidade(cliente.endereco.cidade);
      setEstado(cliente.endereco.estado);
    }
  }, [cliente]);

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
  }

  async function salvarEndereco(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setSalvo(false);
    try {
      const resposta = await fetch("/api/conta/endereco", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep, rua, numero, complemento, bairro, cidade, estado }),
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setCliente(dados.cliente);
        setSalvo(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 900);
      }
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    await fetch("/api/conta/entrar", { method: "DELETE" });
    window.location.href = "/";
  }

  if (carregando || !cliente) {
    return <div className="py-20 text-center text-foreground/50">Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
            <User size={22} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold">{cliente.nome}</h1>
            <p className="text-sm text-foreground/60">{cliente.email}</p>
          </div>
        </div>
        <button
          onClick={sair}
          className="flex items-center gap-1 rounded-full border-2 border-foreground/15 px-4 py-2 text-sm font-bold text-foreground/70 transition hover:border-brand-pink hover:text-brand-pink"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>

      <form
        onSubmit={salvarEndereco}
        className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
      >
        <p className="mb-1 flex items-center gap-2 font-bold text-brand-blue-dark">
          <MapPin size={18} /> Meu endereço de entrega
        </p>
        <p className="mb-2 text-xs text-foreground/50">
          Salve aqui pra não precisar digitar de novo na próxima compra.
        </p>

        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <div>
            <input
              value={cep}
              onChange={(e) => setCep(formatarCep(e.target.value))}
              onBlur={aoSairDoCep}
              placeholder="CEP"
              inputMode="numeric"
              className="w-full rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
            />
            {buscandoCep && (
              <p className="mt-1 text-xs text-foreground/50">Buscando endereço...</p>
            )}
            {erroCep && <p className="mt-1 text-xs text-brand-pink-dark">{erroCep}</p>}
          </div>
          <input
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            placeholder="Rua / Logradouro"
            className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Número"
            className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
          />
          <input
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            placeholder="Complemento (opcional)"
            className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
          />
        </div>

        <input
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          placeholder="Bairro"
          className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />

        <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
          <input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade"
            className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
          />
          <input
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="UF"
            className="rounded-full border-2 border-foreground/15 px-4 py-2 text-center text-sm outline-none focus:border-brand-pink"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="mt-2 self-start rounded-full bg-brand-pink px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-pink-dark disabled:opacity-60"
        >
          {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar endereço"}
        </button>
      </form>
    </div>
  );
}
