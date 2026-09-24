import Image from "next/image";
import Link from "next/link";
import { listarProdutos } from "@/lib/catalog";
import { formatarMoeda } from "@/lib/pricing";
import { BotaoExcluirProduto } from "@/components/BotaoExcluirProduto";

export default async function AdminDashboardPage() {
  const produtos = await listarProdutos();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Produtos ({produtos.length})</h1>
      </div>

      {produtos.length === 0 ? (
        <p className="text-foreground/60">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-yellow/10">
                <Image
                  src={produto.fotos[0] ?? "/produtos/placeholder.svg"}
                  alt={produto.nome}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="line-clamp-1 font-bold">{produto.nome}</p>
                <p className="text-sm text-brand-pink-dark font-semibold">
                  {formatarMoeda(produto.precoVarejo)}
                </p>
                <p className="text-xs text-foreground/50">
                  {produto.esgotado ? "Esgotado" : "Disponível"}
                  {produto.destaque && " · Mais vendido"}
                  {produto.promocao && " · Promoção"}
                </p>
                <div className="mt-auto flex gap-2 pt-2">
                  <Link
                    href={`/admin/produtos/${produto.id}`}
                    className="rounded-full bg-brand-blue px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-blue-dark"
                  >
                    Editar
                  </Link>
                  <BotaoExcluirProduto id={produto.id} nome={produto.nome} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
