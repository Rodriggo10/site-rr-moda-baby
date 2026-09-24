"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro ?? "Senha incorreta.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <form
        onSubmit={entrar}
        className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-black/5"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-pink/10 text-brand-pink">
          <Lock size={24} />
        </div>
        <h1 className="text-center text-xl font-extrabold">Painel — R&amp;R Moda Baby</h1>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha de acesso"
          className="rounded-full border-2 border-foreground/15 px-4 py-2 text-sm outline-none focus:border-brand-pink"
          autoFocus
        />
        {erro && <p className="text-sm text-brand-pink-dark">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-brand-pink px-6 py-3 font-bold text-white transition hover:bg-brand-pink-dark disabled:opacity-60"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
