"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ItemCarrinho } from "./types";

interface CartContextValue {
  itens: ItemCarrinho[];
  adicionarItem: (item: ItemCarrinho) => void;
  removerItem: (produtoId: string, tamanho: string, cor: string) => void;
  atualizarQuantidade: (
    produtoId: string,
    tamanho: string,
    cor: string,
    quantidade: number
  ) => void;
  limparCarrinho: () => void;
  totalItens: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "rr-moda-baby:carrinho";

function mesmoItem(a: ItemCarrinho, b: { produtoId: string; tamanho: string; cor: string }) {
  return a.produtoId === b.produtoId && a.tamanho === b.tamanho && a.cor === b.cor;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {
      // localStorage indisponível (ex: navegação privada) — segue com carrinho vazio
    } finally {
      setCarregado(true);
    }
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    } catch {
      // ignora falha ao persistir
    }
  }, [itens, carregado]);

  const adicionarItem = (novoItem: ItemCarrinho) => {
    setItens((atual) => {
      const existente = atual.find((i) => mesmoItem(i, novoItem));
      if (existente) {
        return atual.map((i) =>
          mesmoItem(i, novoItem)
            ? { ...i, quantidade: i.quantidade + novoItem.quantidade }
            : i
        );
      }
      return [...atual, novoItem];
    });
  };

  const removerItem = (produtoId: string, tamanho: string, cor: string) => {
    setItens((atual) => atual.filter((i) => !mesmoItem(i, { produtoId, tamanho, cor })));
  };

  const atualizarQuantidade = (
    produtoId: string,
    tamanho: string,
    cor: string,
    quantidade: number
  ) => {
    setItens((atual) =>
      atual.map((i) =>
        mesmoItem(i, { produtoId, tamanho, cor }) ? { ...i, quantidade } : i
      )
    );
  };

  const limparCarrinho = () => setItens([]);

  const totalItens = useMemo(
    () => itens.reduce((soma, i) => soma + i.quantidade, 0),
    [itens]
  );

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        totalItens,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
