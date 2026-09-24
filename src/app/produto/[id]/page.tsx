import { notFound } from "next/navigation";
import { buscarProduto } from "@/lib/catalog";
import { ProdutoDetalhe } from "@/components/ProdutoDetalhe";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ProdutoPage({ params }: Params) {
  const { id } = await params;
  const produto = await buscarProduto(id);

  if (!produto) notFound();

  return <ProdutoDetalhe produto={produto} />;
}
