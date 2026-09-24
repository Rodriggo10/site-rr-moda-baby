import { listarProdutos } from "@/lib/catalog";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ busca?: string; categoria?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { busca, categoria } = await searchParams;
  const produtos = await listarProdutos();

  if (categoria && categoria.trim()) {
    const termo = categoria.trim().toLowerCase();
    const resultados = produtos.filter((p) => p.categoria.toLowerCase() === termo);

    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="mb-4 text-sm text-foreground/60">
          {resultados.length} produto(s) em &ldquo;{categoria}&rdquo;
        </p>
        <Section titulo={categoria} produtos={resultados} />
        {resultados.length === 0 && (
          <p className="text-foreground/60">
            Nenhum produto cadastrado nessa categoria ainda.
          </p>
        )}
      </div>
    );
  }

  if (busca && busca.trim()) {
    const termo = busca.trim().toLowerCase();
    const resultados = produtos.filter((p) => p.nome.toLowerCase().includes(termo));

    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="mb-4 text-sm text-foreground/60">
          {resultados.length} resultado(s) para &ldquo;{busca}&rdquo;
        </p>
        <Section titulo={`Resultados para "${busca}"`} produtos={resultados} />
        {resultados.length === 0 && (
          <p className="text-foreground/60">Nenhum produto encontrado.</p>
        )}
      </div>
    );
  }

  const novidades = produtos.filter((p) => p.novidade);
  const maisVendidos = produtos.filter((p) => p.destaque);
  const promocoes = produtos.filter((p) => p.promocao);

  return (
    <>
      <Hero />

      <Section titulo="Novidades" produtos={novidades} />

      <Section
        titulo="Mais vendidos"
        produtos={maisVendidos}
        corFundo="rgba(0,161,215,0.06)"
      />

      <Section titulo="Promoções" produtos={promocoes} />

      <Section
        titulo="Todos os produtos"
        produtos={produtos}
        corFundo="rgba(120,192,82,0.07)"
      />
    </>
  );
}
