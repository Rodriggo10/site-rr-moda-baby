"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/conta/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, senha }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro ?? "Não foi possível criar a conta.");
      }
      window.location.href = "/conta";
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <form
        onSubmit={cadastrar}
        className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-black/5"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
          <UserPlus size={24} />
        </div>
        <h1 className="text-center text-xl font-extrabold">Criar minha conta</h1>
        <p className="text-center text-xs text-foreground/50">
          Opcional — você também pode comprar sem criar uma conta.
        </p>

        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo"
          className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="Telefone / WhatsApp (opcional)"
          className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Crie uma senha (mín. 6 caracteres)"
          className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />

        {erro && <p className="text-sm text-brand-pink-dark">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-brand-pink px-6 py-3 font-bold text-white transition hover:bg-brand-pink-dark disabled:opacity-60"
        >
          {enviando ? "Criando..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-foreground/60">
          Já tem conta?{" "}
          <Link href="/conta/entrar" className="font-bold text-brand-blue-dark hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
