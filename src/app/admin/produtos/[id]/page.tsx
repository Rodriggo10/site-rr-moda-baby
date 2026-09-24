import { notFound } from "next/navigation";
import { buscarProduto } from "@/lib/catalog";
import { ProdutoForm } from "@/components/ProdutoForm";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function EditarProdutoPage({ params }: Params) {
  const { id } = await params;
  const produto = await buscarProduto(id);

  if (!produto) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Editar produto</h1>
      <ProdutoForm produto={produto} />
    </div>
  );
}
