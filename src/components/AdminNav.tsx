"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Plus } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  async function sair() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/admin" className="font-extrabold text-brand-pink-dark">
          Painel — R&amp;R Moda Baby
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos/novo"
            className="flex items-center gap-1 rounded-full bg-brand-pink px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-pink-dark"
          >
            <Plus size={16} /> Novo produto
          </Link>
          <button
            onClick={sair}
            className="flex items-center gap-1 rounded-full border-2 border-foreground/15 px-4 py-2 text-sm font-bold text-foreground/70 transition hover:border-brand-pink hover:text-brand-pink"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>
    </div>
  );
}
