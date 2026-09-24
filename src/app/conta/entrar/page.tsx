"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";

export default function EntrarPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/conta/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro ?? "Não foi possível entrar.");
      }
      window.location.href = "/conta";
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <form
        onSubmit={entrar}
        className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-black/5"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
          <User size={24} />
        </div>
        <h1 className="text-center text-xl font-extrabold">Entrar na minha conta</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Sua senha"
          className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
        />

        {erro && <p className="text-sm text-brand-pink-dark">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-brand-pink px-6 py-3 font-bold text-white transition hover:bg-brand-pink-dark disabled:opacity-60"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-foreground/60">
          Ainda não tem conta?{" "}
          <Link href="/conta/cadastro" className="font-bold text-brand-blue-dark hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
